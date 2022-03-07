const xpTable = require("../../../../assets/tables/xp.json");

const xpCalc = xp => {
    const datas = {
        table: {},
        before_table: {},
        after_table: {},
        level: null,
        progression: {
            percent: 0,
            exp: [0, 0],
        },
    };

    let i = 1;
    for (const n of Object.entries(xpTable)) {
        if (xp >= n[1].total) {
            datas.before_table = i === 1 ? { required: 0, total: 0 } : xpTable[String(i - 1)];
            datas.table = n[1];
            datas.after_table = i === Object.entries(xpTable).length ? { required: 0, total: 0 } : xpTable[String(i + 1)];
            datas.level = Number(n[0]);

            const progress = xp - datas.table.total;

            datas.progression = {
                percent: progress * 100 / datas.after_table.required,
                exp: [progress, datas.after_table.required],
            };
        }
        i++;
    }
    return datas;
};

module.exports = xpCalc;