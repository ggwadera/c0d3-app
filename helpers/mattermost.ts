import fetch from 'node-fetch'
import {
  ChannelInfo,
  GetChannelInfo,
  SendMessage,
  PublicChannelMessage
} from '../@types/mattermost'
const accessToken = process.env.MATTERMOST_ACCESS_TOKEN
const chatServiceUrl = process.env.CHAT_URL

const headers = {
  Authorization: `Bearer ${accessToken}`
}

export const chatSignUp = async (
  username: string,
  password: string,
  email: string
) => {
  try {
    const response = await fetch(`${chatServiceUrl}/users`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        username,
        email,
        password
      })
    })

    if (response.status === 201) {
      return { success: true }
    }
    if (response.status === 400) {
      throw new Error('Invalid or missing parameter in mattermost request')
    }
    if (response.status === 403) {
      throw new Error('Invalid permission')
    }

    throw new Error('Unexpected Response') // Mattermost will only respond with 201, 400 and 403
  } catch (err) {
    throw new Error(err || 'Internal Server Error')
  }
}

export const getChannelInfo: GetChannelInfo = async roomName => {
  try {
    const chatServiceUrl = process.env.CHAT_URL
    const url = `${chatServiceUrl}/teams/name/c0d3/channels/name/${roomName}`

    const response: ChannelInfo = await fetch(url, { headers })
    if (response.status !== 200) throw new Error(response.statusText)

    return await response.json()
  } catch (error) {
    throw new Error(error)
  }
}

export const sendMessage: SendMessage = async (channelId, message) => {
  return fetch(`${chatServiceUrl}/posts`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      channel_id: channelId,
      message
    })
  })
}

export const publicChannelMessage: PublicChannelMessage = async (
  channelName,
  message
) => {
  try {
    const { id } = await getChannelInfo(channelName)
    sendMessage(id, message)
  } catch (error) {
    throw new Error(error)
  }
}

export const getUserByEmail = async (email: string): Promise<string> => {
  try {
    const user = await fetch(`${chatServiceUrl}/users/email/${email}`, {
      headers
    })
    const { username } = await user.json()
    return username
  } catch (error) {
    throw new Error(error)
  }
}
