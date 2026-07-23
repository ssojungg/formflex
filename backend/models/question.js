module.exports = (sequelize, DataTypes) => {
  const Question = sequelize.define(
    'Question',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      surveyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Survey',
          key: 'id',
        },
      },
      type: {
        type: DataTypes.ENUM(
          'MULTIPLE_CHOICE',
          'SUBJECTIVE_QUESTION',
          'CHECKBOX',
          'DROPDOWN',
        ),
        allowNull: false,
      },
      // 작성자가 배치한 문항 순서 (이슈 4: 응답 화면에서 순서 보장)
      orderIndex: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      // SUBJECTIVE_QUESTION의 세부 타입 (이슈 5: short_text/long_text/email/number/date/rating)
      format: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      content: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      imageUrl: {
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
      },
      deletedAt: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: 'Question',
      timestamps: true,
      paranoid: true,
    },
  );

  return Question;
};
