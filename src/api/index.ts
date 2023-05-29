import request from '../utils/request';
import requestForFlask from '../utils/requestForFlask.js';

export const testflask = (user: string, pass: number) => {
    return requestForFlask({
        url: '/mesfilter/test',
        method: 'post',
        params: {
            username: user,
            password: pass
        }
    });
};

export const linksUserCho = (data1: JSON) => {
    return requestForFlask({
        url: '/mesfilter/mesSelectBytime',
        method: 'post',
        data: data1
        // params:{
        //     data:data
        // }
    });
};

export const mutiDraw = (data1: JSON) => {
    return requestForFlask({
        url: '/mesfilter/mesDraw',
        method: 'post',
        data: data1
        // params:{
        //     data:data
        // }
    });
};

export const mutiCross = (data1: JSON) => {
    return requestForFlask({
        url: '/mesfilter/mesCross',
        method: 'post',
        data: data1
        // params:{
        //     data:data
        // }
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
        url: './tablemes2.json',
        method: 'get'
    });
};
