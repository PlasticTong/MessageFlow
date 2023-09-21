import request from '../utils/request';
import requestForFlask from '../utils/requestForFlask.js';
import requestForFlask2 from '../utils/requestForFlask2.js';

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

export const mutiCross = (data1: JSON, data2: JSON,) => {
    return requestForFlask({
        url: '/mesfilter/mesCross',
        method: 'post',
        data: [data1, data2]
        // params:{
        //     data:data
        // }
    });
};

export const markovData = (data1: JSON) => {
    return requestForFlask2({
        url: '/mesfilter/path_generation',
        method: 'post',
        data: data1
        // params:{
        //     data:data
        // }
    });
};

export const selectG = (data1: JSON) => {
    return requestForFlask({
        url: '/mesfilter/selectGra',
        method: 'post',
        data: data1
        // params:{
        //     data:data1
        // }
    });
};

export const readdata = (data1: JSON) => {
    return requestForFlask({
        url: '/mesfilter/readdata',
        method: 'post',
        data: data1
        // params:{
        //     data:data1
        // }
    });
};

export const senddata = (data1: JSON) => {
    return requestForFlask({
        url: '/mesfilter/senddata',
        method: 'post',
        data: data1
        // params:{
        //     data:data1
        // }
    });
};



export const filIp = (data1: JSON) => {
    return requestForFlask({
        url: '/mesfilter/filIp',
        method: 'post',
        data: data1
        // params:{
        //     data:data1
        // }
    });
};

export const uploadfile = (data1: FormData) => {
    return requestForFlask({
        url: '/mesfilter/uploadfile',
        method: 'post',
        data: data1
        // params:{
        //     data:data1
        // }
    });
};


export const getwangzixiao = (data1: JSON) => {
    return requestForFlask({
        url: '/api/getWangZixiaoLayout',
        method: 'post',
        data: data1
        // params:{
        //     data:data1
        // }
    });
};

export const uploadCsvfile = (data1: FormData) => {
    return requestForFlask({
        url: '/mesfilter/uploadForCsv',
        method: 'post',
        data: data1
    });
};

export const readForCsv = (data1: FormData) => {
    return requestForFlask({
        url: '/mesfilter/readForCsv',
        method: 'post',
        data: data1
    });
};

export const searchData = (data1: FormData) => {
    return requestForFlask({
        url: '/mesfilter/searchData',
        method: 'post',
        data: data1
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

export const fetchMar2data = () => {
    return request({
        url: './marTree2.json',
        method: 'get'
    });
};

export const fetchMar3data = () => {
    return request({
        url: './marTree3.json',
        method: 'get'
    });
};
export const fetchMar4data = () => {
    return request({
        url: './marTree4.json',
        method: 'get'
    });
};


export const fetchMutiLinks = () => {
    return request({
        url: './links.json',
        method: 'get'
    });
};

export const fetchMutiNodes = () => {
    return request({
        url: './nodes.json',
        method: 'get'
    });
};