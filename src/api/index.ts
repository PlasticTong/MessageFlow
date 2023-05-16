import request from '../utils/request';

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
