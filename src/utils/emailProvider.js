import nodemailer from 'nodemailer'

const email = ({ config }) => {
  const { service, user, pass } = config

  const transporter = 
    nodemailer
        .createTransport({
            service,
            auth: { user, pass }
        })

  const send = (options) => (
    new Promise((resolve, reject) => (
      transporter
        .sendMail(options, (error, info) => {
            error ? reject(error) : resolve(info)
        })
    ))
  )

  return { send }
}

export default email