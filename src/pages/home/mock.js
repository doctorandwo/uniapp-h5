/**
 * @by oh-my-zerone 2026-10-15
 * 推荐调度者分页 Mock 数据
 * 接口：POST /transportation/orderInfoSearch/pageRecommendedDispatcherList
 *
 * 字段说明参考 ServiceCard 组件实际消费字段（name/avatar/recommendPercent 等），
 * 同时对齐后端分页响应结构：{ code, msg, total, data, rows }
 */

/**
 * 生成模拟封面图（使用项目内置占位图，避免外部依赖）
 * @param {string} seed 用于区分不同卡片的标识
 * @returns {string} 图片地址
 */
const buildCover = seed => `https://picsum.photos/seed/${seed}/304/408`;

/**
 * 推荐调度者基础数据集（共 23 条，便于演示多页分页）
 */
const mockDispatchers = [
    {
        code: 'DP20261015001',
        name: '闽侯低空作业队',
        avatar: buildCover('dp001'),
        collaborationCount: 0, // 0=首次合作
        recommendPercent: 98,
        teamMemberCount: 12,
        certifiedPilotCount: 8,
        deviceModelCount: 3,
        firstDeviceModel: '大疆 M300',
        vehicleCount: 15,
        selfIntroduction: '专注果蔬冷链低空运输，全程温控，准时达。',
    },
    {
        code: 'DP20261015002',
        name: '漳州农飞服务社',
        avatar: buildCover('dp002'),
        collaborationCount: 3, // 合作过 3 次
        recommendPercent: 95,
        teamMemberCount: 9,
        certifiedPilotCount: 6,
        deviceModelCount: 2,
        firstDeviceModel: '极飞 P40',
        vehicleCount: 10,
        selfIntroduction: '香蕉、柚子产地直发，价格透明。',
    },
    {
        code: 'DP20261015003',
        name: '尤溪茶山飞防队',
        avatar: buildCover('dp003'),
        collaborationCount: 1,
        recommendPercent: 92,
        teamMemberCount: 7,
        certifiedPilotCount: 5,
        deviceModelCount: 2,
        firstDeviceModel: '大疆 T40',
        vehicleCount: 8,
        selfIntroduction: '茶叶、食用菌植保飞防，作业经验丰富。',
    },
    {
        code: 'DP20261015004',
        name: '宁德古田银耳专运',
        avatar: buildCover('dp004'),
        collaborationCount: 0,
        recommendPercent: 90,
        teamMemberCount: 11,
        certifiedPilotCount: 7,
        deviceModelCount: 4,
        firstDeviceModel: '大疆 M30',
        vehicleCount: 13,
        selfIntroduction: '食用菌冷链专线，覆盖闽浙沪。',
    },
    {
        code: 'DP20261015005',
        name: '泉州永春芦柑队',
        avatar: buildCover('dp005'),
        collaborationCount: 2,
        recommendPercent: 88,
        teamMemberCount: 6,
        certifiedPilotCount: 4,
        deviceModelCount: 2,
        firstDeviceModel: '极飞 V40',
        vehicleCount: 7,
        selfIntroduction: '芦柑、柑橘类产地直发，时效优先。',
    },
    {
        code: 'DP20261015006',
        name: '莆田文旦柚飞运',
        avatar: buildCover('dp006'),
        collaborationCount: 0,
        recommendPercent: 94,
        teamMemberCount: 8,
        certifiedPilotCount: 5,
        deviceModelCount: 3,
        firstDeviceModel: '大疆 M300',
        vehicleCount: 9,
        selfIntroduction: '文旦柚增量车次，弹性运力。',
    },
    {
        code: 'DP20261015007',
        name: '福州仓山即时配',
        avatar: buildCover('dp007'),
        collaborationCount: 5,
        recommendPercent: 96,
        teamMemberCount: 14,
        certifiedPilotCount: 10,
        deviceModelCount: 3,
        firstDeviceModel: '大疆 M350',
        vehicleCount: 18,
        selfIntroduction: '城市即时低空配送，覆盖全城。',
    },
    {
        code: 'DP20261015008',
        name: '厦门思明生鲜队',
        avatar: buildCover('dp008'),
        collaborationCount: 1,
        recommendPercent: 91,
        teamMemberCount: 10,
        certifiedPilotCount: 6,
        deviceModelCount: 2,
        firstDeviceModel: '极飞 P40',
        vehicleCount: 11,
        selfIntroduction: '商超生鲜补货，准点率高。',
    },
    {
        code: 'DP20261015009',
        name: '三明建宁种业飞防',
        avatar: buildCover('dp009'),
        collaborationCount: 0,
        recommendPercent: 89,
        teamMemberCount: 5,
        certifiedPilotCount: 3,
        deviceModelCount: 2,
        firstDeviceModel: '大疆 T20',
        vehicleCount: 6,
        selfIntroduction: '水稻、种子植保，绿色防控。',
    },
    {
        code: 'DP20261015010',
        name: '龙岩长汀河田鸡运',
        avatar: buildCover('dp010'),
        collaborationCount: 4,
        recommendPercent: 93,
        teamMemberCount: 9,
        certifiedPilotCount: 6,
        deviceModelCount: 3,
        firstDeviceModel: '大疆 M30',
        vehicleCount: 10,
        selfIntroduction: '活禽冷链专线，安全合规。',
    },
    {
        code: 'DP20261015011',
        name: '南平武夷岩茶队',
        avatar: buildCover('dp011'),
        collaborationCount: 0,
        recommendPercent: 87,
        teamMemberCount: 7,
        certifiedPilotCount: 4,
        deviceModelCount: 2,
        firstDeviceModel: '极飞 V40',
        vehicleCount: 8,
        selfIntroduction: '岩茶高山运输，稳妥可靠。',
    },
    {
        code: 'DP20261015012',
        name: '平潭海鲜直飞',
        avatar: buildCover('dp012'),
        collaborationCount: 2,
        recommendPercent: 97,
        teamMemberCount: 12,
        certifiedPilotCount: 9,
        deviceModelCount: 4,
        firstDeviceModel: '大疆 M350',
        vehicleCount: 16,
        selfIntroduction: '海岛海鲜即时达，锁鲜运输。',
    },
    {
        code: 'DP20261015013',
        name: '漳州龙海花卉队',
        avatar: buildCover('dp013'),
        collaborationCount: 0,
        recommendPercent: 86,
        teamMemberCount: 6,
        certifiedPilotCount: 3,
        deviceModelCount: 2,
        firstDeviceModel: '大疆 T40',
        vehicleCount: 7,
        selfIntroduction: '花卉苗木运输，轻拿轻放。',
    },
    {
        code: 'DP20261015014',
        name: '宁德霞浦海带运',
        avatar: buildCover('dp014'),
        collaborationCount: 3,
        recommendPercent: 90,
        teamMemberCount: 8,
        certifiedPilotCount: 5,
        deviceModelCount: 3,
        firstDeviceModel: '大疆 M30',
        vehicleCount: 9,
        selfIntroduction: '海产干货专线，闽东覆盖。',
    },
    {
        code: 'DP20261015015',
        name: '泉州石狮服装飞配',
        avatar: buildCover('dp015'),
        collaborationCount: 0,
        recommendPercent: 85,
        teamMemberCount: 10,
        certifiedPilotCount: 6,
        deviceModelCount: 2,
        firstDeviceModel: '极飞 P40',
        vehicleCount: 11,
        selfIntroduction: '轻工快件配送，灵活高效。',
    },
    {
        code: 'DP20261015016',
        name: '福州闽侯菌菇队',
        avatar: buildCover('dp016'),
        collaborationCount: 1,
        recommendPercent: 92,
        teamMemberCount: 9,
        certifiedPilotCount: 7,
        deviceModelCount: 3,
        firstDeviceModel: '大疆 M300',
        vehicleCount: 12,
        selfIntroduction: '菌菇类冷链，全程监测。',
    },
    {
        code: 'DP20261015017',
        name: '厦门海沧医药配',
        avatar: buildCover('dp017'),
        collaborationCount: 0,
        recommendPercent: 94,
        teamMemberCount: 11,
        certifiedPilotCount: 8,
        deviceModelCount: 2,
        firstDeviceModel: '大疆 M350',
        vehicleCount: 13,
        selfIntroduction: '医药冷链合规运输，资质齐全。',
    },
    {
        code: 'DP20261015018',
        name: '漳州漳浦蔬菜队',
        avatar: buildCover('dp018'),
        collaborationCount: 6,
        recommendPercent: 95,
        teamMemberCount: 13,
        certifiedPilotCount: 9,
        deviceModelCount: 4,
        firstDeviceModel: '大疆 T40',
        vehicleCount: 17,
        selfIntroduction: '蔬菜产地直发，价格稳定。',
    },
    {
        code: 'DP20261015019',
        name: '莆田荔城水果运',
        avatar: buildCover('dp019'),
        collaborationCount: 0,
        recommendPercent: 88,
        teamMemberCount: 7,
        certifiedPilotCount: 4,
        deviceModelCount: 2,
        firstDeviceModel: '极飞 V40',
        vehicleCount: 8,
        selfIntroduction: '当季水果即时配，新鲜直达。',
    },
    {
        code: 'DP20261015020',
        name: '三明沙县小吃料运',
        avatar: buildCover('dp020'),
        collaborationCount: 2,
        recommendPercent: 91,
        teamMemberCount: 8,
        certifiedPilotCount: 5,
        deviceModelCount: 3,
        firstDeviceModel: '大疆 M30',
        vehicleCount: 10,
        selfIntroduction: '食材原料专线，稳定供应。',
    },
    {
        code: 'DP20261015021',
        name: '泉州晋江鞋材飞配',
        avatar: buildCover('dp021'),
        collaborationCount: 0,
        recommendPercent: 84,
        teamMemberCount: 9,
        certifiedPilotCount: 5,
        deviceModelCount: 2,
        firstDeviceModel: '大疆 T20',
        vehicleCount: 9,
        selfIntroduction: '轻工物料配送，时效保障。',
    },
    {
        code: 'DP20261015022',
        name: '福州连江海产队',
        avatar: buildCover('dp022'),
        collaborationCount: 4,
        recommendPercent: 93,
        teamMemberCount: 12,
        certifiedPilotCount: 8,
        deviceModelCount: 3,
        firstDeviceModel: '大疆 M350',
        vehicleCount: 15,
        selfIntroduction: '近海海产锁鲜，快速响应。',
    },
    {
        code: 'DP20261015023',
        name: '漳州东山岛渔获运',
        avatar: buildCover('dp023'),
        collaborationCount: 0,
        recommendPercent: 89,
        teamMemberCount: 10,
        certifiedPilotCount: 6,
        deviceModelCount: 4,
        firstDeviceModel: '大疆 M300',
        vehicleCount: 14,
        selfIntroduction: '远洋渔获冷链，岛际直送。',
    },
];

/**
 * 推荐调度者分页 Mock 返回
 * @param {Object} params 分页与排序参数
 * @param {number} [params.pageNum=1] 当前页码
 * @param {number} [params.pageSize=10] 每页条数
 * @param {number} [params.sortType=1] 排序类型：1=综合推荐, 2=距离最近, 3=车型
 * @param {string} [params.isAsc=''] 排序方向：asc / desc
 * @returns {Promise<Object>} 与后端一致的分页响应结构
 */
export const getRecommendedDispatcherListMock = (params = {}) => {
    const { pageNum = 1, pageSize = 10, sortType = 1, isAsc = '' } = params;

    // 依据排序类型对模拟数据做简单排序，使分页演示更真实
    const sorted = [...mockDispatchers];
    if (sortType === 2) {
        // 距离最近：按推荐度近似模拟（推荐度越高越近）
        sorted.sort((a, b) => (isAsc === 'desc' ? b.recommendPercent - a.recommendPercent : a.recommendPercent - b.recommendPercent));
    } else if (sortType === 3) {
        // 车型：按机型种类数量排序
        sorted.sort((a, b) => (isAsc === 'desc' ? a.deviceModelCount - b.deviceModelCount : b.deviceModelCount - a.deviceModelCount));
    } else {
        // 综合推荐：按推荐度降序
        sorted.sort((a, b) => b.recommendPercent - a.recommendPercent);
    }

    const start = (pageNum - 1) * pageSize;
    const rows = sorted.slice(start, start + pageSize);

    return Promise.resolve({
        code: 1,
        msg: 'success',
        total: sorted.length,
        data: {},
        rows,
    });
};

/**
 * 异常列表 Mock 数据
 * 接口：GET /transportation/waybillAbnormal/selectAbnormalList
 * 字段对齐 AbnormalListVo（仅列组件消费相关字段及必要展示字段）
 */
const mockAbnormalList = [
    { waybillAbnormalCode: 'WA20261016001', waybillCode: 'WB001', waybillNo: 'YD20261016001', loadAddressAlias: '福州', unloadAddressAlias: '天津', loadFormattedAddress: '福建省福州市仓山区', unloadFormattedAddress: '天津市滨海新区', reson: 4, isWarning: 1, avatar: buildCover('ab001'), companyName: '福州果蔬合作社', shipperName: '陈先生', licenseNumber: '闽A12345', goodsBigTypeName: '果蔬' },
    { waybillAbnormalCode: 'WA20261016002', waybillCode: 'WB002', waybillNo: 'YD20261016002', loadAddressAlias: '上海', unloadAddressAlias: '北京', loadFormattedAddress: '上海市浦东新区', unloadFormattedAddress: '北京市大兴区', reson: 1, isWarning: 1, avatar: buildCover('ab002'), companyName: '上海生鲜仓', shipperName: '李女士', licenseNumber: '沪B67890', goodsBigTypeName: '生鲜' },
    { waybillAbnormalCode: 'WA20261016003', waybillCode: 'WB003', waybillNo: 'YD20261016003', loadAddressAlias: '广州', unloadAddressAlias: '成都', loadFormattedAddress: '广东省广州市白云区', unloadFormattedAddress: '四川省成都市双流区', reson: 8, isWarning: 1, avatar: buildCover('ab003'), companyName: '广州农批市场', shipperName: '黄先生', licenseNumber: '粤A11111', goodsBigTypeName: '农副' },
    { waybillAbnormalCode: 'WA20261016004', waybillCode: 'WB004', waybillNo: 'YD20261016004', loadAddressAlias: '厦门', unloadAddressAlias: '杭州', loadFormattedAddress: '福建省厦门市湖里区', unloadFormattedAddress: '浙江省杭州市余杭区', reson: 9, isWarning: 1, avatar: buildCover('ab004'), companyName: '厦门海产行', shipperName: '吴女士', licenseNumber: '闽D22222', goodsBigTypeName: '水产' },
    { waybillAbnormalCode: 'WA20261016005', waybillCode: 'WB005', waybillNo: 'YD20261016005', loadAddressAlias: '深圳', unloadAddressAlias: '武汉', loadFormattedAddress: '广东省深圳市南山区', unloadFormattedAddress: '湖北省武汉市洪山区', reson: 7, isWarning: 0, avatar: buildCover('ab005'), companyName: '深圳电子仓', shipperName: '郑先生', licenseNumber: '粤B33333', goodsBigTypeName: '电子' },
    { waybillAbnormalCode: 'WA20261016006', waybillCode: 'WB006', waybillNo: 'YD20261016006', loadAddressAlias: '南京', unloadAddressAlias: '西安', loadFormattedAddress: '江苏省南京市江宁区', unloadFormattedAddress: '陕西省西安市未央区', reson: 3, isWarning: 1, avatar: buildCover('ab006'), companyName: '南京医药', shipperName: '冯女士', licenseNumber: '苏A44444', goodsBigTypeName: '医药' },
    { waybillAbnormalCode: 'WA20261016007', waybillCode: 'WB007', waybillNo: 'YD20261016007', loadAddressAlias: '重庆', unloadAddressAlias: '昆明', loadFormattedAddress: '重庆市渝北区', unloadFormattedAddress: '云南省昆明市官渡区', reson: 10, isWarning: 1, avatar: buildCover('ab007'), companyName: '重庆百货', shipperName: '蒋先生', licenseNumber: '渝C55555', goodsBigTypeName: '百货' },
    { waybillAbnormalCode: 'WA20261016008', waybillCode: 'WB008', waybillNo: 'YD20261016008', loadAddressAlias: '苏州', unloadAddressAlias: '长沙', loadFormattedAddress: '江苏省苏州市工业园区', unloadFormattedAddress: '湖南省长沙市岳麓区', reson: 2, isWarning: 1, avatar: buildCover('ab008'), companyName: '苏州纺织', shipperName: '韩女士', licenseNumber: '苏E66666', goodsBigTypeName: '纺织' },
    { waybillAbnormalCode: 'WA20261016009', waybillCode: 'WB009', waybillNo: 'YD20261016009', loadAddressAlias: '青岛', unloadAddressAlias: '郑州', loadFormattedAddress: '山东省青岛市城阳区', unloadFormattedAddress: '河南省郑州市金水区', reson: 5, isWarning: 2, avatar: buildCover('ab009'), companyName: '青岛冷链', shipperName: '杨先生', licenseNumber: '鲁B77777', goodsBigTypeName: '冷链' },
    { waybillAbnormalCode: 'WA20261016010', waybillCode: 'WB010', waybillNo: 'YD20261016010', loadAddressAlias: '合肥', unloadAddressAlias: '南昌', loadFormattedAddress: '安徽省合肥市蜀山区', unloadFormattedAddress: '江西省南昌市青山湖区', reson: 6, isWarning: 1, avatar: buildCover('ab010'), companyName: '合肥制造', shipperName: '朱女士', licenseNumber: '皖A88888', goodsBigTypeName: '制造' },
    { waybillAbnormalCode: 'WA20261016011', waybillCode: 'WB011', waybillNo: 'YD20261016011', loadAddressAlias: '宁波', unloadAddressAlias: '福州', loadFormattedAddress: '浙江省宁波市鄞州区', unloadFormattedAddress: '福建省福州市鼓楼区', reson: 4, isWarning: 1, avatar: buildCover('ab011'), companyName: '宁波物流', shipperName: '秦先生', licenseNumber: '浙B99999', goodsBigTypeName: '物流' },
    { waybillAbnormalCode: 'WA20261016012', waybillCode: 'WB012', waybillNo: 'YD20261016012', loadAddressAlias: '无锡', unloadAddressAlias: '济南', loadFormattedAddress: '江苏省无锡市滨湖区', unloadFormattedAddress: '山东省济南市历下区', reson: 8, isWarning: 1, avatar: buildCover('ab012'), companyName: '无锡精密', shipperName: '许女士', licenseNumber: '苏B00001', goodsBigTypeName: '精密' },
];

/**
 * 异常列表 Mock 返回（分页结构与项目其他列表一致：{ code, msg, total, data, rows }）
 * @param {Object} params 分页参数
 * @param {number} [params.pageNum=1] 当前页码
 * @param {number} [params.pageSize=5] 每页条数
 * @returns {Promise<Object>} 分页响应
 */
export const getAbnormalListMock = (params = {}) => {
    const { pageNum = 1, pageSize = 5 } = params;
    const sorted = [...mockAbnormalList];
    const start = (pageNum - 1) * pageSize;
    const rows = sorted.slice(start, start + pageSize);

    return Promise.resolve({
        code: 1,
        msg: 'success',
        total: sorted.length,
        data: {},
        rows,
    });
};

export default mockDispatchers;
