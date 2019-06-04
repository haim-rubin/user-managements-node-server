import uuid from 'uuid'

const init = uuid => (
  (conn, DataTypes) => conn.define('Users', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: () => uuid.v4()
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.TEXT
    },
    salt:{
      type: DataTypes.TEXT
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    token: {
      type: DataTypes.STRING,
      allowNull: true
    },
    fbToken: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    googleToken: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    profilePhoto: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isValid: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    termsOfUse: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }

  },
    {
        freezeTableName: true
    })
 )

 export default init(uuid)