const boardEmpty = () => (
   [{
       "type": "text",
       "text": "ยังไม่มีข้อมูล Board",
   }]
)
const memberEmpty = () => (
   [{
       "type": "text",
       "text": "ยังไม่มีข้อมูล Change ในวันที่เลือก",
   }]
)

// ส่วน Carousel
const boardMain = (boardItems: any) => ([{
   "type": "flex",
   "altText": "My Board",
   "contents": {
       "type": "carousel",
       "contents": boardItems,
   },
}])

// ส่วน Bubble 
const boardItem = (id: string, name: string, lastDate: string) => ({
      "type": "bubble",
      "size": "micro",
      "header": {
        "type": "box",
        "layout": "vertical",
        "contents": [
          {
            "type": "text",
            "text": `${name}`,
            "color": "#ffffff",
            "align": "start",
            "size": "sm",
            "weight": "bold",
            "gravity": "center",
          },
        ],
        "backgroundColor": "#007AC0",
        "paddingTop": "19px",
        "paddingAll": "12px",
        "paddingBottom": "16px",
      },
      "body": {
        "type": "box",
        "layout": "vertical",
        "contents": [
          {
            "type": "text",
            "text": "Last Activity",
            "size": "sm",
            "color": "#666666",
          },
          {
            "type": "text",
            "text": `${lastDate}`,
            "size": "xs",
            "color": "#666666",
          },
        ],
        "spacing": "md",
        "paddingAll": "12px",
      },
      "footer": {
        "type": "box",
        "layout": "vertical",
        "contents": [
          {
            "type": "button",
            "action": {
              "type": "datetimepicker",
              "label": "เลือกวันที่",
              "data": `action=customDate&id=${id}`,
              "mode": "date",
            },
            "style": "primary",
            "height": "sm",
            "margin": "sm",
          },
        ],
      },
      "styles": {
        "footer": {
          "separator": false,
        },
      },
})

// ส่วนข้อความขึ้นต้น Task List
const changeHead = (boardName: string, changeDate: string) => ([
   {
     "type": "text",
     "text": `ข้อมูล Change ของ ${boardName} ณ.วันที่ ${changeDate}`,
     "size": "xs",
     "color": "#8C8C8C",
   },
])

// ส่วน Carousel
const memberMain = (memberItems: any) => ([{
   "type": "flex",
   "altText": "Member List",
   "contents": {
       "type": "carousel",
       "contents": memberItems,
   },
}])

// ส่วน Main Bubble
const memberItem = (name: string, shortName: string, taskList: any) => ({
   "type": "bubble",
   "size": "giga",
   "hero": {
   "type": "box",
   "layout": "vertical",
   "contents": [
      {
         "type": "text",
         "text": `${name}`,
         "color": "#ffffff",
         "weight": "bold",
         "offsetStart": "47px",
         "offsetTop": "7px",
      },
      {
         "type": "box",
         "layout": "vertical",
         "contents": [
            {
               "type": "text",
               "text": `${shortName}`,
            },
         ],
         "position": "absolute",
         "backgroundColor": "#eeeeee",
         "cornerRadius": "xxl",
         "paddingAll": "7px",
         "offsetTop": "10px",
         "offsetStart": "10px",
      },
   ],
   "backgroundColor": "#007AC0",
   "paddingAll": "12px",
   "paddingBottom": "26px",
   },
   "body": {
      "type": "box",
      "layout": "vertical",
      "contents": taskList,
      "spacing": "md",
      "paddingAll": "12px",
   },
   "styles": {
      "footer": {
         "separator": false,
      },
   },
})

// ส่วน Box รายละเอียด Change
const taskItem = (action: string, description: any, actionDate: string) => (
   {
      "type": "box",
      "layout": "vertical",
      "contents": [
         {
            "type": "text",
            "text": `${action}`,
            "size": "md",
            "wrap": true,
            "weight": "bold",
          },
          {
            "type": "box",
            "layout": "vertical",
            "offsetStart": "20px",
            "contents": description,
          },
          {
            "type": "text",
            "text": `${actionDate}`,
            "size": "xs",
            "color": "#8C8C8C",
          },
          {
            "type": "separator",
            "margin": "md",
            "color": "#007AC0",
          },
      ],
      "flex": 1,
   }
)

const taskDetail = (detail: string) => (
   {
     "type": "text",
     "text": `${detail}`,
     "size": "xs",
     "color": "#8C8C8C",
   }
)

export {
   boardEmpty,
   boardMain,
   boardItem,
   memberEmpty,
   changeHead,
   memberMain,
   memberItem,
   taskItem,
   taskDetail,
}