import { getConfig } from "../config"
import * as request from 'request-promise'
// import { ResponseRequest } from "request"
// import { RequestHandler } from "express"

const LINE_MESSAGING_API = 'https://api.line.me/v2/bot/message'

const lineRequest = (options: any) => {
    const config = getConfig()
    const LINE_HEADER = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.line.channelAccessToken}`,
    }

    options.headers = Object.assign({}, options.headers, LINE_HEADER);
    return request(options)
}

const linePost = async (uri: any, body: any) => {
    const options = {
        method: 'POST',
        uri: uri,
        body: body,
        json: true,
    }

    return lineRequest(options)
}

const lineGet = async (uri:any) => {
    const options = {
        method: 'GET',
        uri: uri,
        json: true,
    }

    return lineRequest(options)
}

const verify_signature = (req: any, res: any) => {
    const config = getConfig()
    const crypto = require('crypto')
    const text = JSON.stringify(req.body)
    const signature = crypto.createHmac('SHA256', config.line.channelSecret).update(text).digest('base64').toString()
    if (signature !== req.headers['x-line-signature']) {
        console.log('🧨Attack!!', text)
        res.status(401).send('Unauthorized')
        return false
    }
    return true
}


const getprofile = (user_id: any) => {
    return lineGet("https://api.line.me/v2/bot/profile/" + user_id)
}

const reply = (replyToken: any, payload: any) => {
    return linePost(`${LINE_MESSAGING_API}/reply`, {
        replyToken: replyToken,
        messages: payload,
    })
}

const push = (to: any, payload: any) => {
    return linePost(`${LINE_MESSAGING_API}/push`, {
        to: to,
        messages: payload,
    })
}

export {
    verify_signature,
    getprofile,
    reply,
    push,
}