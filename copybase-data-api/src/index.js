const express = require('express');
const fs = require('node:fs');
const app = express();
const port = 3000;

/**
 * Multer - fs.readstream manager
 * XLSX - XLSX parsing and support
 */
const multer = require('multer');
const upload = multer({ dest: 'C:/Work/Copybase/copybase-data-api-copy/' })
const xlsx = require('xlsx');

/**
 * Posting the XLSX file to '/' returns processed chart data
 */
app.post('/', upload.single('file'), (req, res) => {
    /**
     * Reading XLSX's default worksheet and parsing to JSON
     */
    const workbook = xlsx.readFile(req.file.path);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(worksheet);
    /**
     * Initializing response object
     */
    let mrr = {
        labels: [],
        datasets: {},
        users: {},
    }
    data.forEach((user) => {
        /**
         * StartDate - When the account was created
         * CancelDate = When the user canceled
         */
        let startDate
        let cancelDate
        if (user['data cancelamento'] != undefined) {
            /**
             * If the user has a CancelDate assess which month he canceled in
             * and the lost value of the month because of cancelings
             *
             * (Object) Example = {
                    '6/2022': { mes: 6, valor: 8945.920000000002, canceled: 30 },
                    '3/2022': { mes: 3, valor: 27461.179999999986, canceled: 66 },
                    '10/2022': { mes: 10, valor: 9682.869999999999, canceled: 34 },
                    ...
                }
             */
            cancelDate = xlsx.SSF.parse_date_code(user['data cancelamento']);
                if (mrr.labels.indexOf(cancelDate.m) === -1) {
                mrr.labels.push(cancelDate.m)
                mrr.datasets[cancelDate.m+'/'+cancelDate.y] = {mes: cancelDate.m, valor: user.valor, canceled: 1}
                } else {
                mrr.datasets[cancelDate.m+'/'+cancelDate.y] = {
                    mes: cancelDate.m,
                    valor: user.valor + mrr.datasets[cancelDate.m+'/'+cancelDate.y].valor,
                    canceled: mrr.datasets[cancelDate.m+'/'+cancelDate.y].canceled + 1
                }
            }
        }
        /**
         * Get user StartDate to correctly calculate the number of users not canceled each month
         *
         * (Object) Example = {
                '1': 363,
                '2': 483,
                '3': 515,
                '4': 513,
                ...
            }
         */
        startDate = xlsx.SSF.parse_date_code(user['data início']);
        for (let index = startDate.m; index <= (cancelDate?.m || 12); index++) {
            mrr.users[index] = mrr.users[index] ? mrr.users[index] + 1 : 1
        }
    })
    res.status(200).json({ error: false, data: { message: 'Success', mrr: mrr } });
})

try {
    app.listen(port, () => console.log('Listening on port 3000'));
}
catch{(err) => {
    console.error(err);
    process.exit(1);
}};