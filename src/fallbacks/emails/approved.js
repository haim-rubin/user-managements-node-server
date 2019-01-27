import { compile } from '../compileTemplate'
import path from 'path'
const addApprovedActivationEmailListener = ({
    subject,
    body,
    from,
    appName,
    event,
    send,
    loginUrl,
    relDirname,
    on
}) =>{

    const bodyTemplate =
        compile(path.resolve(relDirname,body))

    const subjectTemplate =
        compile(path.resolve(relDirname,subject))

    const getBody = ({ fullName, username }) => (
        bodyTemplate({
            username,
            loginUrl,
            appName,
            fullName
        })
    )

    const getSubject = ({ appName, username, fullName }) => (
        subjectTemplate({
            appName,
            username,
            fullName
        })
    )

    on(event, ({ username, admin, fullName }) => {
        const html =
            getBody({
                loginUrl,
                appName,
                username,
                fullName
            })

        const subject =
            getSubject({
                appName,
                username,
                fullName
            })

        send({ from, to: admin, subject, html })
    })
}

export default addApprovedActivationEmailListener