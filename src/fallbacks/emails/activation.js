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
    addListener
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

    addListener(event, ({ actionId, username }) => {
        const html =
            getBody({ actionId, username })

        const subject =
            getSubject({ appName, username })

        send({ from, to: username, subject, html })
    })
}

export default addActivationEmailListener