'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('expenses', 'note', {  // Table name from your models/expense.js
      type: Sequelize.STRING,
      allowNull: true,  // Allows empty notes for existing rows
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('expenses', 'note');
  }
};