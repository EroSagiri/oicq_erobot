const { createClient } = require("oicq")
const fs = require("fs")
const https = require("https")

const qq = 3634848254
const password = ""
const master = 2476255563
let allowGroups = [0]
let r18 = true

const bot = createClient(qq)

bot.on("system.login.slider", (data) => {
    process.stdin.once("data", (input) => {
        bot.sliderLogin(input)
    })
})

bot.on("message", (data) => {
    if (data.sender.user_id == master) {
        // bot.sendPrivateMsg(master, data.message)
        // bot.sendPrivateMsg(master, "[CQ:record,file=/home/sagiri/Codes/bot/test.silk]")
        // bot.sendPrivateMsg(master, "[CQ:flash,file=/home/sagiri/Pictures/Pixiv/74378604_p0.png]")
        // var fdfs = bot.sendPrivateMsg(master, elems)
        // bot.deleteMsg(fdfs)
        if (/^色图/.test(data.raw_message)) {
            let url = ""
            let p = data.raw_message.match("^色图 +(.+)")
            if (p) {
                url = 'https://api.lolicon.app/setu/?&apikey=94423325603cf41fe1c355&r18=1&keyword=' + p[1]
                console.log(p[1])
            } else {
                // let keyword = 'sagiri'
                url = 'https://api.lolicon.app/setu/?&apikey=94423325603cf41fe1c355&r18=1'
            }

            https.get(url, (res) => {
                res.setTimeout(10000, () => {
                    console.log("超时")
                })

                if (res.statusCode === 200) {
                    if (/^application\/json/.test(res.headers['content-type'])) {
                        let rawData = ''
                        res.on('data', (chunk) => {
                            rawData += chunk
                        })

                        res.on('end', () => {
                            try {
                                const parsedData = JSON.parse(rawData)
                                if (parsedData.code == 0) {
                                    let msg_text = ''
                                    msg_text += "标题: " + parsedData.data[0].title + "\n"
                                    msg_text += "作者: " + parsedData.data[0].author + "\n"
                                    msg_text += "pid: " + parsedData.data[0].pid

                                    if (data.sub_type == "friend") {
                                        bot.sendPrivateMsg(data.sender.user_id, msg_text)
                                    } else if (data.sub_type == "group") {
                                        bot.sendPrivateMsg(data.sender.user_id, msg_text)
                                    }

                                    https.get(parsedData.data[0].url, res => {
                                        res.setTimeout(10000, () => {
                                            console.log("超时")
                                        })

                                        let imageData = ''
                                        res.setEncoding("binary")
                                        res.on('data', chunk => {
                                            imageData += chunk
                                        })
                                        res.on("end", () => {
                                            fs.writeFile(parsedData.data[0].pid + ".jpg", imageData, "binary", err => {

                                            })
                                            if (data.sub_type == "friend") {
                                                bot.sendPrivateMsg(data.user_id, "[CQ:flash,file=" + parsedData.data[0].pid + ".jpg]")
                                            } else if (data.sub_type == "group") {
                                                bot.sendPrivateMsg(data.user_id, "[CQ:flash,file=" + parsedData.data[0].pid + ".jpg]")
                                            }

                                        })
                                    })
                                }
                            } catch (e) {
                                console.error(e.message)
                            }
                        })
                    }
                } else {
                    bot.sendPrivateMsg(data.user_id, "get 失败")
                }
            }).on("error", e => {
                bot.sendPrivateMsg(data.user_id, e)
            })
        }
    }
})

bot.on("system.login", (data) => {

})

bot.on("request.friend.add", (data) => {
    bot.setFriendAddRequest(data.flag, true, "发送: 色图 <关键字(可选)>\n获取色图", false)
    bot.sendPrivateMsg(master, "同意: " + data.user_id + " " + data.nickname + "\m添加好友请求")
})

bot.on("request.group.invite", (data) => {
    bot.setGroupAddRequest(data.flag, true, "发送: 色图 <关键字(可选)>\n获取色图", false)
    bot.sendPrivateMsg(master, "同意加群邀请: \n群: " + data.group_id + " " + data.group_name + "\n邀请人: " + data.nickname + " " + data.user_id)
})

bot.on("notice.group.decrease", (data) => {
    bot.sendPrivateMsg(master, "群减少: " + data.group_id + " " + data.group_name)
})

bot.on("notice.friend.decrease", (data) => {
    bot.sendPrivateMsg(master, "好友减少: " + data.user_id + " " + data.nickname)
})

bot.login(password)
