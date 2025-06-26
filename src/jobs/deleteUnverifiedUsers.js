const User = require('../models/userModel');
const Email = require('./../utils/email');

module.exports = (agenda) => {
  agenda.define('delete unverified users', async (job, done) => {
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);

    const users = await User.find({
      verified: false,
      createdAt: { $lt: tenDaysAgo },
    });

    for (const user of users) {
      await user.deleteOne();
      await new Email(user).sendDeletionDueToInactiveNotice();
      console.log(`Deleted unverified user: ${user.email}`);
    }

    done();
  });
};
