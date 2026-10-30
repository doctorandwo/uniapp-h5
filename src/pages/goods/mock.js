/**
 * 货源查询 列表 Mock 数据
 * 接口：GET /orderInfoSearch/getAppOrderInfoList
 * 接口文档：src/pages/goods/货源查询.md
 *
 * 响应结构严格对齐文档：
 *   { msg, code, data: { startRow, ..., list: [ [ { distance, createTime, scenario, isDregs,
 *     redisOrderInfoListVoList: [...], openTheElectronicFence, orderCode } ] ], total, pageNum, ... } }
 *
 * 注意：文档响应字段表中不含卡片 UI 目前依赖的 workStartTime / workEndTime / priceModel /
 * exAllDeliveryFeePractical / goodsName 等字段，此处不做臆造，统一缺省（页面侧留空），待后端补充后再对接。
 * （卡片状态已改用 info.status，装卸货时间已改用 info.loadingTime / info.unloadingTime；
 *  列表筛选字段已对齐文档 status / beginTime / endTime / publishMode）
 */

const pad = n => String(n).padStart(2, '0');
const fmt = (offsetMs = 0) => {
    const d = new Date(Date.now() + offsetMs);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

/**
 * 货源码二维码 Mock
 * 真实接口：GET /transportation/waybill/app/getCym/{code}，返回 `data:image/png;base64,...` 完整 data URL
 * 前端不解析内容、直接作为 image src 渲染，故 Mock 用 SVG data URL 模拟二维码外观（仅开发环境使用）
 * @param {string} code 货源编码
 * @returns {object} 文档响应结构（data 为完整 data URL）
 */
export const getCymMock = (code = '') => {
    // 由货源编码生成确定性的伪随机点阵，模拟二维码外观
    let seed = 0;
    for (const ch of String(code)) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
    const rand = () => (seed = (seed * 1103515245 + 12345) >>> 0) / 2 ** 32;
    const size = 25;
    const cell = 8;
    const inFinder = (x, y) => (x < 7 && y < 7) || (x >= size - 7 && y < 7) || (x < 7 && y >= size - 7);
    let rects = '';
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if (!inFinder(x, y) && rand() > 0.5) {
                rects += `<rect x="${x * cell}" y="${y * cell}" width="${cell}" height="${cell}"/>`;
            }
        }
    }
    // 三个角定位框（二维码 finder pattern）
    const finder = (fx, fy) =>
        `<rect x="${fx * cell}" y="${fy * cell}" width="${7 * cell}" height="${7 * cell}" fill="none" stroke="#000" stroke-width="${cell}"/>` +
        `<rect x="${(fx + 2) * cell}" y="${(fy + 2) * cell}" width="${3 * cell}" height="${3 * cell}"/>`;
    const px = size * cell;
    const svg =
        `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="0 0 ${px} ${px}">` +
        `<rect width="${px}" height="${px}" fill="#fff"/>` +
        `<g fill="#000">${rects}${finder(0, 0)}${finder(size - 7, 0)}${finder(0, size - 7)}</g></svg>`;
    return { msg: '', code: 1, data: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}` };
};

/**
 * 构造 redisAddressList 中的一条地址
 * @param {object} p 地址入参
 * @returns {object} 地址对象（字段对齐文档）
 */
const buildAddress = ({ province, city, districtCode, street, formattedAddress, contact, phone, lat, lng }) => ({
    country: '中国',
    code: '',
    districtCode,
    city,
    cityCode: '',
    wlInfo: '',
    latitude: lat,
    addressFenceInfo: {
        fenceName: '',
        centerLng: lng,
        platFenceCode: '',
        code: '',
        geomType: 1,
        geomText: '',
        centerLat: lat,
    },
    contactPhoneShow: phone,
    contactShow: contact,
    enclosureRadius: 0,
    formattedAddress,
    province,
    street,
    localtionOld: '',
    contact,
    id: 0,
    redisOrderFreightVoList: [],
    longitude: lng,
    orderFreightVo: { addFee: 0, reductionFee: 0, detailList: [], lossList: [] },
});

/**
 * 构造 redisOrderGoodsVoList 中的一条货物信息
 * @param {object} p 货物入参
 * @returns {object} 货物对象（字段对齐文档）
 */
const buildGoods = ({ number, remainingNumber, weight, remainingWeight, stowageStatus, shipmentPrice, goodsTypeName, goodsBigTypeName, goodsType, goodsBigType }) => ({
    remainingNumber,
    code: '',
    goodsTypeName,
    totalType: '',
    robbedOrder: 0,
    goodsBigTypeName,
    number,
    isModifyFinish: 0,
    limitWastage: '',
    isOneselfLoad: 0,
    remainingWeight,
    balanceRuleCode: '',
    goodsBigType,
    notRobbedOrder: 0,
    vehicleType: '',
    stowageStatus,
    priceWastage: 0,
    driverPrice: 0,
    shipmentPrice,
    isOneselfUnload: 0,
    vehicleMaxWeight: 0,
    weight,
    goodsType,
    vehicleLength: '',
    perWeight: 0,
    goodsPrice: 0,
    orderCode: '',
    businessType: '',
    isDel: 0,
});

/**
 * 构造单条订单（data.list.[i][j].redisOrderInfoListVoList 元素）
 * @param {object} p 订单入参
 * @returns {object} 订单对象（字段对齐文档）
 */
const buildOrder = ({ code, mainOrderNumber, orderName, adminName, companyName, createTime, updateTime, goods, loadAddr, unloadAddr }) => ({
    updateCode: '',
    companyName,
    publishMode: 1,
    mainOrderNumber,
    adminCode: '',
    createCode: '',
    isSpecified: 0,
    uploadLoadVoucher: 0,
    redisOrderStatus: {
        verifiedNum: 0,
        applyPaymentNum: 0,
        receivingOrderNum: 0,
        loadingNum: 0,
        applyInvoiceNum: 0,
        unloadingNum: 0,
        invoicedNum: 0,
        reviewNum: 0,
        paidNum: 0,
        completedNum: 0,
        InvalidNum: 0,
        settledNum: 0,
    },
    pubilshCode: '',
    isManual: 1,
    updateUserName: '',
    prepayStatus: 0,
    vehicleCodes: [],
    // 货集码列表（货源码不再经列表下发，弹窗打开时由 getCym 接口单独获取，见 getCymMock）
    redisOrderClassGoodsVoList: [],
    branchCode: '',
    adminName,
    scanCodeVoucher: 0,
    vehicleCount: 0,
    redisAddressList: [loadAddr, unloadAddr],
    createPhoneNumber: '',
    updatePhoneNumber: '',
    projectName: '',
    status: 0,
    loadType: '1',
    shipperFactoryCode: '',
    code,
    opNickName: '',
    phonenumber: '',
    remark: '',
    opUserName: '',
    isNewFence: 0,
    openLoanPrepayStatus: 0,
    projectCode: '',
    scenario: '',
    redisOrderFreightInfoVoList: [],
    haveWaybill: 0,
    isPublic: 1,
    orderName,
    uploadUnloadVoucher: 0,
    classCode: '',
    waybillCount: 0,
    updateTime,
    updateNickName: '',
    estimatedDeliveryDays: 1,
    createTime,
    redisOrderSpecifiedVoList: [],
    isDel: 0,
    redisOrderGoodsVoList: [goods],
});

/** data.list 内层元素（一个分组项，含订单列表） */
const buildGroupItem = order => ({
    distance: '',
    createTime: order.createTime,
    scenario: '',
    isDregs: 0,
    redisOrderInfoListVoList: [order],
    openTheElectronicFence: 0,
    orderCode: order.code,
});

/**
 * 计费方式：向装货地址（redisAddressList[0]）注入 ruleItemCode='19' 的运费规则项
 * 文档字段：redisAddressList[].redisOrderFreightVoList[].ruleItemCode / ruleValue
 * @param {object} order 订单
 * @param {number} ruleValue 计费方式值（1 卸货量估算 / 2 装货量估算 / 3 装卸货最小数量估算 / 4 装卸货最大数量估算）
 * @returns {object} 处理后的订单
 */
const withPriceTypeRule = (order, ruleValue) => {
    const loadAddr = order.redisAddressList?.[0];
    if (loadAddr) {
        loadAddr.redisOrderFreightVoList = [
            {
                addressUnloadingCode: '',
                updateCode: '',
                code: '',
                ruleItemCode: '19',
                ruleDetailShipmentCode: '',
                updateTime: order.updateTime,
                type: 1,
                ruleCode: '',
                ruleValue: String(ruleValue),
                unit: '',
                orderGoodsCode: '',
                createTime: order.createTime,
                orderCode: order.code,
                createCode: '',
                isDel: 0,
                orderAddressCode: '',
            },
        ];
    }
    return order;
};

/** 全量订单（Mock 源数据） */
const mockOrders = [
    buildOrder({
        code: 'DK20261009001',
        mainOrderNumber: 'HY202610090001',
        orderName: '煤炭运输-福州至无锡',
        adminName: '福诺能源有限公司',
        companyName: '福诺能源',
        createTime: fmt(-30 * 60 * 1000),
        updateTime: fmt(-5 * 60 * 1000),
        goods: buildGoods({
            number: 5,
            remainingNumber: 2,
            weight: 12.5,
            remainingWeight: 8,
            stowageStatus: '0',
            shipmentPrice: 300,
            goodsTypeName: '煤炭',
            goodsBigTypeName: '能源',
            goodsType: 'COAL',
            goodsBigType: 'ENERGY',
        }),
        loadAddr: buildAddress({
            province: '福建省',
            city: '福州市',
            districtCode: '350112',
            street: '松下煤场1号堆场',
            formattedAddress: '福建省福州市长乐区松下煤场1号堆场',
            contact: '陈大壮',
            phone: '132****9876',
            lat: 25.96,
            lng: 119.62,
        }),
        unloadAddr: buildAddress({
            province: '江苏省',
            city: '无锡市',
            districtCode: '320214',
            street: '安海能源仓卸货区',
            formattedAddress: '江苏省无锡市新吴区安海能源仓卸货区',
            contact: '林美丽',
            phone: '138****8888',
            lat: 31.49,
            lng: 120.31,
        }),
    }),
    buildOrder({
        code: 'DK20261009002',
        mainOrderNumber: 'HY202610090002',
        orderName: '香蕉运输-漳州至厦门',
        adminName: '福诺农业发展有限公司',
        companyName: '福诺农业',
        createTime: fmt(-2 * 60 * 60 * 1000),
        updateTime: fmt(-40 * 60 * 1000),
        goods: buildGoods({
            number: 2,
            remainingNumber: 2,
            weight: 6,
            remainingWeight: 6,
            stowageStatus: '0',
            shipmentPrice: 500,
            goodsTypeName: '香蕉',
            goodsBigTypeName: '农副产品',
            goodsType: 'FRUIT',
            goodsBigType: 'AGRI',
        }),
        loadAddr: buildAddress({
            province: '福建省',
            city: '漳州市',
            districtCode: '350602',
            street: '天宝镇香蕉园',
            formattedAddress: '福建省漳州市芗城区天宝镇香蕉园',
            contact: '陈大壮',
            phone: '132****9876',
            lat: 24.63,
            lng: 117.55,
        }),
        unloadAddr: buildAddress({
            province: '福建省',
            city: '厦门市',
            districtCode: '350203',
            street: '莲前西路28号',
            formattedAddress: '福建省厦门市思明区莲前西路28号',
            contact: '林美丽',
            phone: '138****8888',
            lat: 24.48,
            lng: 118.14,
        }),
    }),
    buildOrder({
        code: 'DK20261009003',
        mainOrderNumber: 'HY202610090003',
        orderName: '茶叶运输-尤溪至福州',
        adminName: '福诺茶业有限公司',
        companyName: '福诺茶业',
        createTime: fmt(-4 * 60 * 60 * 1000),
        updateTime: fmt(-90 * 60 * 1000),
        goods: buildGoods({
            number: 3,
            remainingNumber: 1,
            weight: 4.5,
            remainingWeight: 1.5,
            stowageStatus: '1',
            shipmentPrice: 350,
            goodsTypeName: '茶叶',
            goodsBigTypeName: '农副产品',
            goodsType: 'TEA',
            goodsBigType: 'AGRI',
        }),
        loadAddr: buildAddress({
            province: '福建省',
            city: '三明市',
            districtCode: '350426',
            street: '管前镇绿茶园',
            formattedAddress: '福建省三明市尤溪县管前镇绿茶园',
            contact: '王建国',
            phone: '139****1111',
            lat: 26.17,
            lng: 118.19,
        }),
        unloadAddr: buildAddress({
            province: '福建省',
            city: '福州市',
            districtCode: '350102',
            street: '五一北路158号',
            formattedAddress: '福建省福州市鼓楼区五一北路158号',
            contact: '李秀英',
            phone: '135****2222',
            lat: 26.09,
            lng: 119.31,
        }),
    }),
    buildOrder({
        code: 'DK20261009004',
        mainOrderNumber: 'HY202610090004',
        orderName: '文旦柚运输-仙游至福州',
        adminName: '福诺果蔬有限公司',
        companyName: '福诺果蔬',
        createTime: fmt(-6 * 60 * 60 * 1000),
        updateTime: fmt(-3 * 60 * 60 * 1000),
        goods: buildGoods({
            number: 2,
            remainingNumber: 2,
            weight: 8,
            remainingWeight: 8,
            stowageStatus: '2',
            shipmentPrice: 1800,
            goodsTypeName: '文旦柚',
            goodsBigTypeName: '农副产品',
            goodsType: 'FRUIT',
            goodsBigType: 'AGRI',
        }),
        loadAddr: buildAddress({
            province: '福建省',
            city: '莆田市',
            districtCode: '350322',
            street: '度尾镇文旦柚基地',
            formattedAddress: '福建省莆田市仙游县度尾镇文旦柚基地',
            contact: '陈大壮',
            phone: '132****9876',
            lat: 25.35,
            lng: 118.6,
        }),
        unloadAddr: buildAddress({
            province: '福建省',
            city: '福州市',
            districtCode: '350111',
            street: '福新东路',
            formattedAddress: '福建省福州市晋安区福新东路',
            contact: '黄志明',
            phone: '134****6666',
            lat: 26.08,
            lng: 119.34,
        }),
    }),
].map((order, index) => withPriceTypeRule(order, index + 1));

/**
 * 货源列表 Mock 响应（结构对齐文档，含分页）
 * @param {object} params 查询参数（使用 pageNum / pageSize）
 * @returns {object} 文档响应结构
 */
export const getAppOrderInfoListMock = (params = {}) => {
    const { pageNum = 1, pageSize = 10 } = params;
    const total = mockOrders.length;
    const start = (pageNum - 1) * pageSize;
    const pageOrders = mockOrders.slice(start, start + pageSize);
    // 实际接口 data.list 为扁平对象数组（非文档声明的数组套数组）
    const list = pageOrders.map(order => buildGroupItem(order));
    const pages = Math.ceil(total / pageSize) || 1;

    return {
        msg: '',
        code: 1,
        data: {
            startRow: start + 1,
            navigatepageNums: Array.from({ length: pages }, (_, i) => i + 1),
            prePage: Math.max(pageNum - 1, 0),
            hasNextPage: pageNum < pages,
            nextPage: pageNum < pages ? pageNum + 1 : 0,
            pageSize,
            endRow: start + pageOrders.length,
            list,
            pageNum,
            navigatePages: pages,
            navigateFirstPage: 1,
            total,
            pages,
            size: pageOrders.length,
            isLastPage: pageNum >= pages,
            hasPreviousPage: pageNum > 1,
            navigateLastPage: pages,
            isFirstPage: pageNum <= 1,
        },
    };
};

export default mockOrders;
