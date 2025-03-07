import Dysmsapi20170525, * as $Dysmsapi20170525 from '@alicloud/dysmsapi20170525'
import * as OpenApi from '@alicloud/openapi-client'
import * as Util from '@alicloud/tea-util'

const config = new OpenApi.Config({
  accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID,
  accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET
})

config.endpoint = 'dysmsapi.aliyuncs.com'
const client = new Dysmsapi20170525(config)

interface SendSMSParams {
  phone: string
  template: string
  params: Record<string, string>
}

export async function sendSMS({ phone, template, params }: SendSMSParams) {
  const sendSmsRequest = new $Dysmsapi20170525.SendSmsRequest({
    phoneNumbers: phone,
    signName: process.env.ALIYUN_SMS_SIGN_NAME,
    templateCode: template,
    templateParam: JSON.stringify(params)
  })

  try {
    await client.sendSms(sendSmsRequest)
  } catch (error) {
    console.error('发送短信失败:', error)
    throw error
  }
}