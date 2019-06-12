import uuid from 'uuid'

const init = uuid => (
  (conn, DataTypes) => conn.define('Tokens', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: () => uuid.v4()
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    ip: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    token: {
      type: DataTypes.STRING,
      allowNull: true
    },
    userAgentIdentity: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
    {
        freezeTableName: true
    })
 )

 export default init(uuid)