import { compile } from '../compileTemplate'
import getAbsolutePath from '../../utils/getAbsolutePath'

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