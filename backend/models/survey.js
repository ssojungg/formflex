module.exports = (sequelize, DataTypes) => {
  const Survey = sequelize.define(
    'Survey',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'User',
          key: 'id',
        },
      },
      title: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      open: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      url: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      font: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      color: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      buttonStyle: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      mainImageUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      deadline: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      emailReportEnabled: {
        //몇명이상 되면 이메일 보내는 기능 켰는지 켰는지 확인
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      emailReportThreshold: {
        //몇 명 이상일 때 발송할 지
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      reportEmail: {
        //어느 이메일로 보낼지
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      emailReportSent: {
        //이미 발송했는지 (중복 발송 방지용)
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },

    {
      tableName: 'Survey',
      timestamps: true,
      paranoid: true,
    },
  );

  return Survey;
};
