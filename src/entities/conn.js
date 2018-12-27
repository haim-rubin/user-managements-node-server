import Sequelize from 'sequelize'

const init = ({ config }) => {
    const { name, username, password, host, dialect, pool, logging } = config.database
    return(
        new Sequelize(
            name,
            username,
            password,
            {
                host,
                dialect,
                pool,
                logging
            }
        )
    )
}

export default init
