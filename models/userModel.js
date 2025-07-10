'use strict';

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            unique:true,
            primaryKey: true,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [2-30]
            },
            unique: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        country: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        walletBalance: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0.0,
        },
        totalDeposit: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0.0,
        },
        totalWithdrawal: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0.0,
        },
        totalInvestment: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0.0,
        },
        verificationToken: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        isVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        verificationDate:{
            type: DataTypes.DATE,
            allowNull: true,
        },
        passwordResetToken: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        passwordResetExpires: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        refreshToken: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        role: {
            type: DataTypes.ENUM,
            values: ["user", "admin"],
            defaultValue: 'user',
            allowNull: false,
        }
    }, { tableName: 'user',timestamps: true });

    //association
    User.associate = (models) =>{
        User.hasMany(models.Investment, {foreignKey: 'userId', as: 'investment'});
        User.hasMany(models.Withdrawal, {foreignKey: 'userId', as: 'withdrawal'});
        User.hasMany(models.Deposit, {foreignKey: 'userId', as: 'deposit'});
    }

    return User;
};
