import moment from 'moment-timezone';
import dotenv from 'dotenv';

dotenv.config();

const TIMEZONE = process.env.TIMEZONE || 'America/Chicago';

export const formatDate = (date: Date): string => {
    return moment(date).tz(TIMEZONE).format('DD/MM/YYYY HH:mm:ss');
};