const REGION = 'asia-southeast2';
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as util_line from './repositories/utils/line'
import * as msgTrello from './repositories/message/trello'
import { getConfig, initialConfig } from './repositories/config'

initialConfig('../../config.json')
const config = getConfig()

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: `${config.firebase.databaseURL}`,
})
const firestore = admin.firestore()

export const webhookTrello = functions.region(REGION).https.onRequest( async(req, res) => {
  const action =  req.body.action
  if(action && action.display.translationKey !== 'unknown') {
    const data = {
      action: action,
      changeTime: Date.now() + 25200000,
    }
    const board = action.data.board
    board.changeTime = Date.now() + 25200000
    await firestore.collection('board').doc(action.data.board.id).set(board)
    await firestore.collection('change').doc(action.id).set(data)
  }
  res.status(200).send("OK")
})


export const webhookLINE = functions.region(REGION).https.onRequest( async(req, res) => {
  console.log('🚀 Start Webhook!!', JSON.stringify(req.body) )
  if(!req.body.events) { res.status(200).end()}

  const event = req.body.events[0]
  if(typeof(event) === 'undefined') { res.status(200).end()}

  try {
    await util_line.verify_signature(req, res)
    let replyMessage: any = null

    switch (event.type) {
      
      case 'message':
        if (event.message.type === 'text') {
          const message = event.message.text
          if(message.toLowerCase() === 'trello') {
            replyMessage = await getBoardPayload()
          }

          if(replyMessage) {
            await util_line.reply(event.replyToken, replyMessage)
          }
        }
        break
  
      case 'postback':
        let data = event.postback.data
        data = data.split('&').map( (temp:any) => {
          return temp.split('=')[1]
        })
        let start = null
        let end = null
        const boardId = data[1]

        if( data[0] === 'customDate') {

          const paramsDate = event.postback.params.date.split('-')
          start = new Date(paramsDate[0], parseInt(paramsDate[1])-1, paramsDate[2], 0, 0, 0)
          end = new Date(paramsDate[0], parseInt(paramsDate[1])-1, paramsDate[2], 23,59,59)
        }
        replyMessage = await getChangeData(boardId, start, end)

        if(replyMessage) {
          await util_line.reply(event.replyToken, replyMessage)
        }

        break 
      
      default:
    }
  } catch (err) {
    console.error(err)
    res.status(500).end()
  }
  res.status(200)

})

const getBoardPayload = async() => {
  const data = await firestore.collection('board').orderBy('changeTime', 'desc').limit(12).get()
  if (!data.empty) {
      const payloadBoardList = data.docs.map( (doc:any) => {
        const {id, name, changeTime} = doc.data()
        return msgTrello.boardItem(id, name, formatTime(changeTime))
      })
      return msgTrello.boardMain(payloadBoardList)
      
  } else {
    return msgTrello.boardEmpty()
  }
}

const getChangeData = async(boardId: any, start: any, end: any) => {
  const data = await firestore.collection('change')
    .where('action.data.board.id', '==', boardId)
    .where('changeTime', '>=', parseInt(start.getTime()))
    .where('changeTime', '<=', parseInt(end.getTime()))
    .orderBy('changeTime', 'desc')
    .get()
  const changeData: any = []
  const memberData: any = []
  const excludeItem = ['memberCreator', 'contextOn']
  if (!data.empty) {
    data.docs.forEach( (doc:any) => {
        const { action, changeTime } = doc.data()
        const { idMemberCreator } = action
        let { translationKey } = action.display
        translationKey = translationKey.replace('action_', '').toLowerCase().split('_').map((word:string) => {
          return (word.length > 1) ? word[0].toUpperCase() + word.substr(1) : word;
        }).join(' ');

        let actionTxt = ''
        actionTxt = `${translationKey} `

        const description = []
        for (const item in action.display.entities) {
          if ( !excludeItem.includes(item) ) {
            const tempDisplay = action.display.entities[item]
            description.push( msgTrello.taskDetail("- " + item + ": " + (tempDisplay.text ? tempDisplay.text : (tempDisplay.date ? tempDisplay.date : (tempDisplay.comment ? tempDisplay.comment : '') ) )) )
          }
        }
        
        const result = memberData.filter( (temp2:any) => { return temp2.id === idMemberCreator })
        if(result.length <= 0) {
          memberData.push({id:idMemberCreator, profile: action.memberCreator})
        }
        changeData.push({ memberId: idMemberCreator, actionTxt: actionTxt, description: description, changeTime: formatTime(changeTime) })
      })
      return await getChangePayload(boardId, start, memberData, changeData)
  } else {
    return msgTrello.memberEmpty()
  }
  
}

const getBoardInfo = async(boardId: string) => {
  const doc = await firestore.collection('board').doc(boardId).get()
  if (doc.exists) {
    return doc.data() 
  } else {
    return false
  }
}

const getChangePayload = async(boardId: string, start: any, memberData: any, changeData: any) => {
  const boardInfo = await getBoardInfo(boardId)
  if(!boardInfo) {
    return false
  }
  const msgHead:any = msgTrello.changeHead(boardInfo.name, formatDate(start.getTime()) )

  if(memberData.length > 0) {
    const payloadMemberList = memberData.map( (row:any) => {
      const {id, profile} = row
      const payloadTaskList = changeData.filter((row2: any) => { return row2.memberId === id }).map( (row2: any) => {
        return msgTrello.taskItem(row2.actionTxt, row2.description, row2.changeTime)
      })
      return msgTrello.memberItem(profile.fullName, profile.initials, payloadTaskList)
    })
    
    const payloadTask = msgTrello.memberMain(payloadMemberList)
    return msgHead.concat(payloadTask)
    // return msgTrello.memberMain(payloadMemberList)
  } else {
    const payloadTask = msgTrello.memberEmpty()
    return msgHead.concat(payloadTask)
    // return msgTrello.memberEmpty()
  }
}

const formatTime = (timestamp: any) => {
  const date = new Date(Number(timestamp))
  return ('0' + date.getDate()).slice(-2) + '/' + ('0' + (date.getMonth() + 1)).slice(-2) + '/' + date.getFullYear() + ' ' + ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2)
}

const formatDate = (timestamp: any) => {
  const date = new Date(Number(timestamp))
  return ('0' + date.getDate()).slice(-2) + '/' + ('0' + (date.getMonth() + 1)).slice(-2) + '/' + date.getFullYear()
}