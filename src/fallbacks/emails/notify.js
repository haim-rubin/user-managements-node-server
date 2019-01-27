import { compile } from '../compileTemplate'
import path from 'path'

const addNotifyEmailListener = ({
    subject,
    body,
    from,
    appName,
    event,
    send,
    admin,
    relDirname,
    on
}) =>{

    const bodyTemplate =
        compile(path.resolve(relDirname, body))

    const subjectTemplate =
        compile(path.resolve(relDirname,subject))

    const getBody = ({ fullName, username }) => (
        bodyTemplate({
            username,
            fullName,
            appName
        })
    )

    const getSubject = ({ username, fullName }) => (
        subjectTemplate({
            appName,
            username,
            fullName
        })
    )

    on(event, ({ username, fullName }) => {
        const html =
            getBody({
                username,
                fullName,
                admin,
                appName
            })

        const subject =
            getSubject({
                appName,
                username,
                fullName,
                appName
            })

        send({ from, to: admin, subject, html })
    })
}

export default addNotifyEmailListener