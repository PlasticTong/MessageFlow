import request from '../utils/request';
import requestForFlask from '../utils/requestForFlask.js';

export const testflask = (user:string,pass:number) => {
    return requestForFlask({
        url: '/mesfilter/test',
        method: 'get'
    });
};

export const fetchData = () => {
    return request({
        url: './table.json',
        method: 'get'
    });
};

export const fetchMesData = () => {
    return request({
        url: './tablemes.json',
        method: 'get'
    });
};
