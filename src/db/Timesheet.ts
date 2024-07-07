import { openTimesheetDb, toMidnightUTC } from "./db";

export interface ITimesheet {
	clockIn: Date | undefined;
	clockOut: Date  | undefined;
	breaks: {
		breakIn: Date;
		breakOut: Date | undefined | null;
	}[];
}

interface ITimesheetRow {
    clock_in: string;
    clock_out: string | null;
    break_in: string | null;
    break_out: string | null;
}

export interface IBreak {
	breakIn: Date;
	breakOut: Date | null | undefined;
}

export async function insertTimesheet(username: string, clockIn: Date) {
    const normalisedDay = toMidnightUTC(clockIn).toISOString().split('T')[0];
    clockIn.setMilliseconds(0);

    const db = await openTimesheetDb();

    try {
        await db.run(`INSERT INTO timesheet (username, date, clock_in) VALUES ($username, $date, $clockIn)`, {
            $username: username,
            $date: normalisedDay,
            $clockIn: clockIn.toISOString().split('T')[1],
        })
    } catch(err){
        console.log(`Failed to insert into DB with data`, username, normalisedDay, clockIn, err);
        throw new Error('Failed to insert into Database')
    } finally {
        await db.close();
    }
}

export async function setClockIn(username: string, day: Date, clockIn: Date){
    const normalisedDay = toMidnightUTC(day).toISOString().split('T')[0];
    clockIn.setMilliseconds(0);

    const db = await openTimesheetDb();

    try {
        await db.run(`UPDATE timesheet SET clock_in = $clockIn WHERE username = $username AND date = $date`, {
            $username: username,
            $date: normalisedDay,
            $clockIn: clockIn.toISOString().split('T')[1],
        })
    } catch(err){
        console.log(`Failed to update DB with data`, username, normalisedDay, clockIn, err);
        throw new Error('Failed to insert into Database')
    } finally {
        await db.close();
    }
}

export async function setBreakIn(username: string, day: Date, breakIn: Date){
    const normalisedDay = toMidnightUTC(day).toISOString().split('T')[0];
    breakIn.setMilliseconds(0);

    const db = await openTimesheetDb();

    try {
        await db.run(`INSERT INTO timesheet_breaks (username, date, break_in) VALUES ($username, $date, $breakIn)`, {
            $username: username,
            $date: normalisedDay,
            $breakIn: breakIn.toISOString().split('T')[1],
        })
    } catch(err){
        console.log(`Failed to insert DB with data`, username, normalisedDay, breakIn, err);
        throw new Error('Failed to insert into Database')
    } finally {
        await db.close();
    }
}

export async function insertBreakOut(username: string, day: Date, breakOut: Date){
    const normalisedDay = toMidnightUTC(day).toISOString().split('T')[0];
    breakOut.setMilliseconds(0);

    const db = await openTimesheetDb();

    try {
        await db.run(`UPDATE timesheet_breaks SET break_out = $breakOut WHERE username = $username AND date = $date`, {
            $username: username,
            $date: normalisedDay,
            $breakOut: breakOut.toISOString().split('T')[1],
        })
    } catch(err){
        console.log(`Failed to update DB with data`, username, normalisedDay, breakOut, err);
        throw new Error('Failed to insert into Database')
    } finally {
        await db.close();
    }
}

export async function setClockOut(username: string, day: Date, clockOut: Date){
    const normalisedDay = toMidnightUTC(day).toISOString().split('T')[0];
    clockOut.setMilliseconds(0);

    const db = await openTimesheetDb();

    try {
        await db.run(`UPDATE timesheet SET clock_out = $clockOut WHERE username = $username AND date = $date`, {
            $username: username,
            $date: normalisedDay,
            $clockOut: clockOut.toISOString().split('T')[1],
        })
    } catch(err){
        console.log(`Failed to update DB with data`, username, normalisedDay, clockOut, err);
        throw new Error('Failed to insert into Database')
    } finally {
        await db.close();
    }
}

export async function getTimesheet(username: string, day: Date): Promise<ITimesheet | undefined>{
    const normalisedDay = toMidnightUTC(day).toISOString().split('T')[0];

    const db = await openTimesheetDb();

    try {
        return db.all(`SELECT timesheet.clock_in, timesheet.clock_out, timesheet_breaks.break_in, timesheet_breaks.break_out 
            FROM timesheet 
            LEFT JOIN timesheet_breaks ON timesheet.username = timesheet_breaks.username AND timesheet.date = timesheet_breaks.date
            WHERE timesheet.username = $username AND timesheet.date = $date`, {
            $username: username,
            $date: normalisedDay,
        }).then((rows: Array<ITimesheetRow>) => {
            if (!rows || rows.length === 0){
                return undefined;
            }

            return {
                clockIn: new Date(normalisedDay + 'T' + rows[0].clock_in),
                clockOut: rows[0].clock_out ? new Date(normalisedDay + 'T' + rows[0].clock_out) : undefined,
                breaks: rows.filter((row) => row.break_in).map((row) => {
                    return {
                        breakIn: new Date(normalisedDay + 'T' + row.break_in),
                        breakOut: row.break_out ? new Date(normalisedDay + 'T' + row.break_out) : undefined
                    }
                })
            }
        });
    } catch(err){
        console.log(`Failed to select from DB with data`, username, normalisedDay, err);
        throw new Error('Failed to insert into Database')
    } finally {
        await db.close();
    }
}

export async function overrideTimesheet(
	username: string,
	day: Date,
	clockIn: Date,
	clockOut: Date | null | undefined,
) {
	const normalisedDay = toMidnightUTC(day).toISOString().split('T')[0];

    const db = await openTimesheetDb();

    try {
        await db.run(`INSERT INTO timesheet (username, date, clock_in, clock_out) 
            VALUES ($username, $date, $clockIn, $clockOut)
            ON CONFLICT (username, date) DO UPDATE
            SET clock_in = excluded.clock_in, clock_out = excluded.clock_out;`, {
            $username: username,
            $date: normalisedDay,
            $clockIn: clockIn.toISOString().split('T')[1],
            $clockOut: clockOut ? clockOut.toISOString().split('T')[1] : null,
        })
    } catch(err){
        console.log(`Failed to update DB with data`, username, normalisedDay, clockOut, err);
        throw new Error('Failed to insert into Database')
    } finally {
        await db.close();
    }
}

export async function overrideTimesheetBreaks(
	username: string,
	day: Date,
	breaks: {
		breakIn: Date;
		breakOut: Date | null;
	}[],
) {
	const normalisedDay = toMidnightUTC(day).toISOString().split('T')[0];

    const db = await openTimesheetDb();


    const sql = `
            BEGIN TRANSACTION;
            DELETE FROM timesheet_breaks WHERE username = '${username}' AND date = '${normalisedDay}';

            INSERT INTO timesheet_breaks (username, date, break_in, break_out) 
            VALUES ${breaks.map((breakEntry, i) => {
                return `('${username}', '${normalisedDay}', '${new Date(breakEntry.breakIn).toISOString().split('T')[1]}', '${breakEntry.breakOut ? new Date(breakEntry.breakOut).toISOString().split('T')[1] : null}')`
            })};
            COMMIT;
        `
    try {
        await db.exec(sql);
    } catch(err){
        await db.exec('ROLLBACK');
        console.log('Failed to override Timesheet breaks', err)
        throw new Error('Failed to insert into Database')
    } finally {
        await db.close();
    }
}
