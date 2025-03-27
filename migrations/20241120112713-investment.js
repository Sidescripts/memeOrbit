'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
      await queryInterface.createTable('Investment', {
      id: {
        allowNull: false,
        primaryKey: true,
        unique:true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      plans: {
        type: Sequelize.ENUM,
        values: ["basic plan", "moon plan", "boom plan"],
        defaultValue: "basic plan",
        allowNull: false,
      },
      userId: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        references: {
          model: 'User',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      amount: {
        type: Sequelize.DECIMAL(10,2),
        allowNull: false,
      },
      duration: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      investmentId: {
        type: Sequelize.STRING,
        allowNull: false
      },
      investmentDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM,
        values: ["ongoing", "completed"],
        defaultValue: "ongoing",
        allowNull: false,
      },
      returnOnInvestment: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      // Add other fields as required
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Investment');
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
