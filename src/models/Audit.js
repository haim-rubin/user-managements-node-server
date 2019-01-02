import uuid from 'uuid'

const init = uuid => (
  (conn, DataTypes) =>
    conn.define('Audit', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: () => uuid.v4()
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false
        },
        actionName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        requestParams: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    },
    {
        freezeTableName: true
    })
)

export default init(uuid)