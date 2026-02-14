import dbConnect from './lib/db';
import Question from './models/Question';

async function check() {
    await dbConnect();
    const count = await Question.countDocuments();
    console.log('Total questions:', count);
    process.exit(0);
}

check();
