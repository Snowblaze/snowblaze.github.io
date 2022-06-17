import { format, parseISO } from "date-fns";

const transformDate = (date: string) => format(parseISO(date), 'LLLL d, yyyy');

export default transformDate;
