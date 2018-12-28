import Sequelize from 'sequelize'

const init = ({ config }) => {
    const {
        name,
        username,
        password,
        settings } = config

    return(
        new Sequelize(
            name,
            username,
            password,
            settings
        )
    )
}

export default init
