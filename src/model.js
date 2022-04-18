/**
 * Use local sqlite file for DB
 */

const Sequelize = require('sequelize');

let sequelize;
// noinspection JSValidateTypes
sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite3',
    logging: false,
});

/**
 * Either a client or contractor
 */
class Profile extends Sequelize.Model {
}

Profile.init(
    {
        firstName: {
            type: Sequelize.STRING,
            allowNull: false
        },
        lastName: {
            type: Sequelize.STRING,
            allowNull: false
        },
        profession: {
            type: Sequelize.STRING,
            allowNull: false
        },
        balance: {
            type: Sequelize.DECIMAL(12, 2)
        },
        type: {
            type: Sequelize.ENUM('client', 'contractor')
        }
    },
    {
        sequelize,
        modelName: 'Profile'
    }
);

/**
 * Contracts are assigned to contractors by clients
 */
class Contract extends Sequelize.Model {
}

Contract.init(
    {
        terms: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        status: {
            type: Sequelize.ENUM('new', 'in_progress', 'terminated')
        }
    },
    {
        sequelize,
        modelName: 'Contract'
    }
);

/**
 * Contractors work on jobs
 */
class Job extends Sequelize.Model {
}

Job.init(
    {
        description: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        price: {
            type: Sequelize.DECIMAL(12, 2),
            allowNull: false
        },
        paid: {
            type: Sequelize.BOOLEAN,
            default: false
        },
        paymentDate: {
            type: Sequelize.DATE
        }
    },
    {
        sequelize,
        modelName: 'Job'
    }
);

/**
 * Define table relations
 */
Profile.hasMany(Contract, {as: 'Contractor', foreignKey: 'ContractorId'});
Contract.belongsTo(Profile, {as: 'Contractor'});
Profile.hasMany(Contract, {as: 'Client', foreignKey: 'ClientId'});
Contract.belongsTo(Profile, {as: 'Client'});
Contract.hasMany(Job);
Job.belongsTo(Contract);

module.exports = {
    sequelize,
    Profile,
    Contract,
    Job
};
