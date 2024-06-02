const { CronJob, CronTime } = require('cron'); // https://www.npmjs.com/package/cron

let jobs;

function doSomething() {
    console.log('do something with this', this);
}

// tạo job cho tất cả led đang có trên database.
const ledSchedulerInit = () => {
    // giả sử đây là data đọc được từ db.
    const leds = [
        {
            schedule: { time: new Date(2024, 6-1, 2, 12, 2, 0), option: 'OFF' },
            userId: '65f97183eb8ef517c781539a',
            state: 1,
            type: 'led',
            id: '6649a8168950f2c97e5cc8cd'
        },
        {
            schedule: { time: new Date(2024, 6-1, 2, 12, 5, 0), option: 'ON' },
            userId: 'user2',
            state: 0,
            type: 'led',
            id: 'led2'
        },
        {
            schedule: { time: new Date(2024, 6-1, 2, 12, 7, 0), option: 'NONE' },
            userId: 'user3',
            state: 0,
            type: 'led',
            id: 'led3'
        },
    ];

    jobs = leds.map(led => {
        const { time } = led.schedule;
        console.log(time.toLocaleString());
        return CronJob.from({
            cronTime: `${time.getSeconds()} ${time.getMinutes()} ${time.getHours()} * * *`,
            onTick: doSomething,
            start: true,
            context: led,
        });
    });
}

//  Hàm dùng để thay đổi thời gian và option khi người dùng thay đổi trên web.
const modifyJob = (led) => {
    console.log("modify job");
    const index = jobs.findIndex(job => job.context.id == led.id);
    if(index === -1) {
        console.log("can not modify job");
        return;
    }

    const { time } = led.schedule;
    jobs[index].context = led;
    jobs[index].setTime(new CronTime(`${time.getSeconds()} ${time.getMinutes()} ${time.getHours()} * * *`));
}

// Dùng để thêm job khi người dùng tạo mới một led.
const addJob = (led) => {
    console.log("add job");
    const index = jobs.findIndex(job => job.context.id == led.id);
    if(index !== -1) {
        console.log("job for this led has already existed");
        return;
    }

    const { time } = led.schedule;
    const job = CronJob.from({
        cronTime: `${time.getSeconds()} ${time.getMinutes()} ${time.getHours()} * * *`,
        onTick: doSomething,
        start: true,
        context: led,
    });
    jobs.push(job); // push job vừa tạo vào mảng để quản lí (modify).
}

ledSchedulerInit();

// Người dùng vừa tạo một led mới nên ta phải tạo job cho nó.
addJob({
    schedule: { time: new Date(2024, 6-1, 2, 12, 2, 0), option: 'OFF' },
    userId: '65f97183eb8ef517c781539a',
    state: 1,
    type: 'led',
    id: 'newled'
});

// setTimeout(modifyJob, 2*60*1000, {
//     schedule: { time: new Date(2024, 6-1, 2, 11, 54, 0), option: 'ON' },
//     userId: '65f97183eb8ef517c781539a',
//     state: 0,
//     type: 'led',
//     id: '6649a8168950f2c97e5cc8cd'
// });