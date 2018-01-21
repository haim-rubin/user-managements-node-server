const uuid = require('uuid')

module.exports = (conn, DataTypes) => (
 
  conn.define('ActionVerifications', {
    actionId: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: () => uuid.v4()
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    actionType: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
    {
        freezeTableName: true
    })

)