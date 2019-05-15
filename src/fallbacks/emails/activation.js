import { compile } from '../compileTemplate'
import getAbsolutePath from '../../utils/getAbsolutePath'

const addActivationEmailListener = ({
    body,
    subject,
    verificationUrl,
    from,
    appName,
    event,
    send,
    relDirname,
    on
}) => {


    const bodyTemplate =
        compile(
            getAbsolutePath(body, relDirname)
        )

    const subjectTemplate =
        compile(
            getAbsolutePath(subject, relDirname)
        )

    const getBody = ({ actionId, username }) => (
        bodyTemplate({
            actionId,
            username,
            verificationUrl,
            appName
        })
    )

    const getSubject = ({ appName }) => (
        subjectTemplate({
            appName
        })
    )

    on(event, ({ actionId, username }) => {
        const html =
            getBody({ actionId, username })

        const subject =
            getSubject({ appName, username })

        send({ from, to: username, subject, html })
    })
}

export default addActivationEmailListener