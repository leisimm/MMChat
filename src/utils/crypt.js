const crypto = require('crypto')

exports.aesEncrypt = (key, data) => {
  const cipher = crypto.createCipher('aes-256-cbc', key)
  let encryptedData = cipher.update(data, 'utf8', 'base64')
  encryptedData += cipher.final('base64')
  return encryptedData
}

exports.aesDecrypt = (key, encryptedData) => {
  const decipher = crypto.createDecipher('aes-256-cbc', key)
  let data = decipher.update(encryptedData, 'base64', 'utf8')
  data += decipher.final('utf8')
  return data
}

exports.sha256 = (data) => {
  return crypto.createHash('sha256').update(data).digest('base64')
}

exports.md5 = (data) => {
  return crypto.createHash('md5').update(data).digest('base64')
}
