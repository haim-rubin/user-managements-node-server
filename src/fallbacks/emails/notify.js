import { compile } from '../compileTemplate'
import getAbsolutePath from '../../utils/getAbsolutePath'

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
        compile(
            getAbsolutePath(body, relDirname)
        )

    const subjectTemplate =
        compile(
            getAbsolutePath(subject, relDirname)
        )

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