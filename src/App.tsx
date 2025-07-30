import {useEffect, useState} from 'react'
import './App.css'
import {
    Affix,
    Button,
    Col,
    DatePicker,
    DatePickerProps,
    FloatButton,
    Modal,
    Row,
    Segmented,
    Space,
    Statistic,
    Table,
    TableProps,
    Tag,
    Badge,
    Card,
    Form,
    Input,
    InputNumber, Select,
    Image, Drawer, List,
} from 'antd'
import {Chart} from '@antv/g2'
import {FlagOutlined, PlusOutlined, PayCircleOutlined} from "@ant-design/icons";
import {RangePickerProps} from "antd/es/date-picker";
import dayjs from 'dayjs';

const {TextArea} = Input;

function App() {

    // 数据定义
    const [jsonData, setJsonData]: any[] = useState([])
    const [totalProfit, setTotalProfit] = useState<number>(0) // 累计盈亏
    const [winRate, setWinRate] = useState<number>(0) // 累计胜率
    const [transactionsNum, setTransactionsNum] = useState<number>(0) // 总交易次数
    const [profitTradeNum, setProfitTradeNum] = useState<number>(0) // 盈利次数
    const [profitTradeMoney, setProfitTradeMoney] = useState<number>(0) // 盈利单总金额
    const [lossTradeNum, setLossTradeNum] = useState<number>(0) // 亏损次数
    const [lossTradeMoney, setLossTradeMoney] = useState<number>(0) // 亏损单总金额
    const [averageProfitLossRatio, setAverageProfitLossRatio] = useState<number>(0) // 平均盈亏比
    const [maxSingleProfit, setMaxSingleProfit] = useState<number>(0) // 单笔最大盈利
    const [maxSingleLoss, setMaxSingleLoss] = useState<number>(0) // 单笔最大亏损
    const [totalTradeTime, setTotalTradeTime] = useState<number>(0) // 总交易时间
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [open, setOpen] = useState(false);

    const {RangePicker} = DatePicker

    const columns: any = [
        {
            title: '交易商品',
            dataIndex: 'name',
            key: 'name',
            render: (value: any) => {
                if (value.includes('XAU') || value.includes('GOLD')) {
                    return <Button color="gold" variant="solid">{value}</Button>
                } else if (value.includes('BTC') || value.includes('ETH')) {
                    return <Button color="default" variant="solid">{value}</Button>
                } else if (value.includes('EUR') || value.includes('USD') || value.includes('JPY') || value.includes('GBP')) {
                    return <Button color="geekblue" variant="solid">{value}</Button>
                } else if (value.includes('NAS') || value.includes('30') || value.includes('100') || value.includes('500')) {
                    return <Button color="green" variant="solid">{value}</Button>
                } else {
                    return <Button type="primary">{value}</Button>
                }
            },
            filters: [
                {
                    text: 'XAUUSD',
                    value: 'XAUUSD',
                },
                {
                    text: 'BTCUSD',
                    value: 'BTCUSD',
                },
                {
                    text: 'USDJPY',
                    value: 'USDJPY',
                },
                {
                    text: 'EURUSD',
                    value: 'EURUSD',
                },
                {
                    text: 'GBPUSD',
                    value: 'GBPUSD',
                },
                {
                    text: 'NAS100',
                    value: 'NAS100',
                },
            ],
            filterMode: 'tree',
            filterSearch: true,
            onFilter: (value, record) => record.name.startsWith(value as string),
        },
        {
            title: '买/卖',
            dataIndex: 'type',
            key: 'type',
            align: 'center',
            render: (value: any) => {
                return value == 'Buy' ? <Tag color="green">{value}</Tag> :
                    <Tag color="red">{value}</Tag>
            },
            filters: [
                {
                    text: 'Buy',
                    value: 'Buy',
                },
                {
                    text: 'Sell',
                    value: 'Sell',
                },
            ],
            filterSearch: true,
            onFilter: (value, record) => record.type.startsWith(value as string),
        },
        {
            title: '总手数',
            dataIndex: 'lot',
            key: 'lot',
            align: 'right',
            render: (value: any) => {
                return <Tag color="blue"><span style={{fontSize: "15px"}}>{value}</span></Tag>
            },
            sorter: (a: any, b: any) => a.lot - b.lot,
        },
        {
            title: '盈亏(USD)',
            dataIndex: 'profit',
            key: 'profit',
            align: 'right',
            render: (value: any) => {
                return value >= 0 ? <span style={{color: 'green', fontSize: '1.1rem'}}>${value}</span> :
                    <span style={{color: 'red', fontSize: '1.1rem'}}>${value}</span>
            },
            sorter: (a: any, b: any) => a.profit - b.profit,
        },
        {
            title: '持仓时长',
            dataIndex: 'holdTime',
            key: 'holdTime',
            align: 'right',
            // @ts-ignore
            render: (text, record) => (
                <span>{dayjs(record.endDate).diff(dayjs(record.startDate), 'day') + 1} 天</span> // 直接在渲染时计算
            ),
            sorter: (a: any, b: any) => a.text - b.text,
        },
        {
            title: '开仓时间',
            dataIndex: 'startDate',
            key: 'startDate',
            align: 'center',
            render: (value: any) => {
                return value == null || value == "" ? "" :
                    <span>{value} <span style={{fontSize: "11px"}}>({getWeekDay(value)})</span></span>
            },
            sorter: (a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
        },
        {
            title: '平仓时间',
            dataIndex: 'endDate',
            key: 'endDate',
            align: 'center',
            defaultSortOrder: 'descend',
            render: (value: any) => {
                return value == null || value == "" ? "" :
                    <span>{value} <span style={{fontSize: "11px"}}>({getWeekDay(value)})</span></span>
            },
            sorter: (a: any, b: any) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime(),
        },
        {
            title: '周期K线图',
            dataIndex: 'kLineImage',
            key: 'kLineImage',
            render: (value: any) => {
                return <Image width={100} src={value}/>
            },
        },
        {
            title: '是否加仓',
            dataIndex: 'addPositions',
            key: 'addPositions',
            align: 'center',
            render: (value: any) => {
                return value == true ? <Tag color="green">是</Tag> :
                    <Tag color="blue">否</Tag>
            },
            filters: [
                {
                    text: '是',
                    value: '是',
                },
                {
                    text: '否',
                    value: '否',
                },
            ],
            filterSearch: true,
            onFilter: (value, record) => record.addPositions ? "是" : "否" === value,
        },
        {
            title: '交易计划',
            dataIndex: 'tradePlan',
            key: 'tradePlan',
            width: 150,
        },
        {
            title: '复盘总结',
            dataIndex: 'reviewSummary',
            key: 'reviewSummary',
            width: 300,
            ellipsis: false
        }
    ];

    /**
     * 坚守交易原则和哲学
     */
    const philosophyData = [
        {
            title: '交易哲学三大支柱: 1. 资金管理：生存与复利的基石 2. 交易方法论：市场规律的认知框架 3. 心理纪律：人性弱点的终极对抗',
            description: '保障资本是第一原则 交易哲学三大支柱之首 交易是马拉松，先保证不被淘汰，再追求胜风险控制优于利润追求',
            href: '',
        },
        {
            title: '截断亏损 让利润奔跑 情绪是交易的天敌 纪律是唯一的解药',
            description: '跨越【随机获利】到【稳定盈利】的关键 纪律高于天赋',
            href: '',
        },
        {
            title: '道氏趋势理论 123单边法则+2B震荡法则',
            description: '我从来不追求一夜暴富的机会，最重要的是保证本金安全，其次是追求一致性的报酬，然后以一部分获利进行风险较高的交易。只要这样做，你就会发现大赚一笔的机会还是会出现，但我并不需要承担过度的风险',
            href: 'https://read.douban.com/reader/column/1925480/chapter/13109970/',
        },
        {
            title: '根据计划交易，并严格遵守计划 计划是抵御市场噪音的盾牌 ',
            description: '顺势而为 趋势是你的朋友',
            href: '',
        },
        {
            title: '盈利才加仓进攻 移损保利润防守 加仓后必移损',
            description: '移动止损实现【亏损有限化，盈利最大】, 按回撤30%利润移动止损。 金字塔加仓的核心是盈利后递减加码，通过【底部重仓、顶部轻仓】降低持仓成本，抵御回调风险。凯利公式计算初始入金。',
            href: '',
        },
        {
            title: '不要让获利头寸变为亏损 亏损头寸不可加码 加仓亏损头寸会放大风险 一旦心存怀疑，立即出场',
            description: '鳄鱼原则：若被鳄鱼咬住脚，唯一选择是断脚逃生。止损是生存底线，应基于技术位或波动率（如ATR值）设定，而非主观承受力',
            href: '',
        },
    ];

    useEffect(() => {

        fetch('data.json') // 本地文件路径需与当前页面同源或配置服务器
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json(); // 解析为 JavaScript 数组
            })
            .then(dataArray => {
                // 按照时间date排序
                dataArray = dataArray.sort((a: any, b: any) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
                setJsonData(dataArray)

                // 创建 G2 图表
                const chart = new Chart({
                    container: 'container',
                    autoFit: true,
                    /*  height: 460*/
                });

                // 配置数据和视图
                chart
                    .area() // 使用面积图
                    .data({
                        value: dataArray,
                        transform: [{
                            type: 'custom', // 自定义变换
                            callback: (data: any) => {
                                let cumulative = 0;
                                let profitNum = 0;
                                let profitMoney = 0;
                                let lossNum = 0;
                                let lossMoney = 0;
                                let transactionsNum = 0;
                                return data.map((item: any) => {
                                    cumulative += item.profit
                                    if (item.profit > 0) {
                                        profitNum += 1
                                        profitMoney += item.profit
                                    } else if (item.profit < 0) {
                                        lossNum += 1
                                        lossMoney += item.profit
                                    }
                                    transactionsNum = profitNum + lossNum
                                    setTotalProfit(cumulative);
                                    // @ts-ignore
                                    setWinRate((profitNum / transactionsNum * 100).toFixed(1))
                                    setTransactionsNum(transactionsNum)
                                    setProfitTradeNum(profitNum)
                                    setProfitTradeMoney(profitMoney)
                                    setLossTradeNum(lossNum)
                                    setLossTradeMoney(lossMoney)
                                    // @ts-ignore
                                    setAverageProfitLossRatio((profitMoney / Math.abs(lossMoney)).toFixed(1))
                                    setMaxSingleProfit(Math.max(...data.map((item: any) => item.profit)))
                                    setMaxSingleLoss(Math.min(...data.map((item: any) => item.profit)))
                                    return {endDate: item.endDate, equity: cumulative};
                                });
                            }
                        }]
                    })
                    .encode('x', 'endDate')
                    .encode('y', 'equity')
                    .encode('shape', 'smooth') // 'area', 'smooth', 'hvh', 'vh', 'hv'
                    .style('fillOpacity', 0.9) // 面积填充透明度
                    // .encode('color', 'name')
                    .animate('enter', {type: 'zoomIn', duration: 1000})
                    .style('lineWidth', 1) // 曲线宽度
                    .style('fill', 'linear-gradient(90deg, #52c41a 0%, #1677ff 50%, #f5222d 100%)') // 填充
                    .style('stroke', '#1B9AEE') // 边框
                    .tooltip({
                        title: 'endDate',
                        items: [{channel: 'y', valueFormatter: (d) => `${d.toFixed(1)} 美元`}]
                    });

                // 配置坐标轴
                chart.axis('x', {
                    title: '交易时间曲线',
                    labelFormatter: (d: any) => new Date(d).toLocaleDateString('zh-CN').slice(5)
                });
                chart.axis('y', {
                    title: '累计盈亏 (美元)',
                    gridLineDash: [2, 2]
                });

                // 渲染图表
                chart.render()

                // 根据品种统计盈亏占比  方便找到自己擅长的品种交易
                let totalProfitTradeMoney = 0;
                let totalProfitNum = 0;
                let totalLossNum = 0;
                let totalLossTradeMoney = 0;

                const map = new Map();
                for (const item of dataArray.filter((i: any) => i.profit > 0)) {
                    if (map.has(item.name)) {
                        map.set(item.name, map.get(item.name) + item.profit);
                    } else {
                        map.set(item.name, item.profit);
                    }
                    totalProfitNum++
                    totalProfitTradeMoney += item.profit
                }
                const chartProportionData = Array.from(map, ([item, percent]) => ({item, percent}))
                    .sort((a, b) => b.percent - a.percent);

                // 饼状图占比
                const chartProportion = new Chart({
                    container: 'chartProportionContainer',
                    autoFit: true,
                });
                chartProportion.coordinate({type: 'theta', outerRadius: 0.8, innerRadius: 0.5});
                chartProportion
                    .interval()
                    .data(chartProportionData)
                    .transform({type: 'stackY'})
                    .encode('y', 'percent')
                    .encode('color', 'item')
                    .legend('color', {position: 'bottom', layout: {justifyContent: 'center'}})
                    .label({
                        position: 'outside',
                        text: (data) => `${data.item}: $ ${data.percent}`,
                    })
                    .tooltip((data) => ({
                        name: data.item,
                        value: `$ ${data.percent}`,
                    }));
                chartProportion
                    .text()
                    .style('text', totalProfitNum + "单盈利品种")
                    // Relative position
                    .style('x', '50%')
                    .style('y', '50%')
                    .style('dy', -25)
                    .style('fontSize', 18)
                    .style('fill', '#8c8c8c')
                    .style('textAlign', 'center');

                chartProportion
                    .text()
                    .style('text', '$' + totalProfitTradeMoney.toFixed(0))
                    // Relative position
                    .style('x', '50%')
                    .style('y', '50%')
                    .style('dy', 25)
                    .style('fontSize', 38)
                    .style('fill', '#3f8600')
                    .style('textAlign', 'center');

                chartProportion.render();


                const map2 = new Map();
                for (const item of dataArray.filter((i: any) => i.profit < 0)) {
                    if (map2.has(item.name)) {
                        map2.set(item.name, map2.get(item.name) + Math.abs(item.profit));
                    } else {
                        map2.set(item.name, Math.abs(item.profit));
                    }
                    totalLossNum++
                    totalLossTradeMoney += Math.abs(item.profit);
                }
                const chartProportionData2 = Array.from(map2, ([item, percent]) => ({item, percent}))
                    .sort((a, b) => b.percent - a.percent);

                const chartProportion2 = new Chart({
                    container: 'chartProportionContainer2',
                    autoFit: true,
                });
                chartProportion2.coordinate({type: 'theta', outerRadius: 0.8, innerRadius: 0.5});
                chartProportion2
                    .interval()
                    .data(chartProportionData2)
                    .transform({type: 'stackY'})
                    .encode('y', 'percent')
                    .encode('color', 'item')
                    .legend('color', {position: 'bottom', layout: {justifyContent: 'center'}})
                    .label({
                        position: 'outside',
                        text: (data) => `${data.item}: $ -${data.percent}`,
                    })
                    .tooltip((data) => ({
                        name: data.item,
                        value: `$ -${data.percent}`,
                    }));
                chartProportion2
                    .text()
                    .style('text', totalLossNum + "单亏损品种")
                    // Relative position
                    .style('x', '50%')
                    .style('y', '50%')
                    .style('dy', -25)
                    .style('fontSize', 18)
                    .style('fill', '#8c8c8c')
                    .style('textAlign', 'center');

                chartProportion2
                    .text()
                    .style('text', '$' + totalLossTradeMoney.toFixed(0))
                    // Relative position
                    .style('x', '50%')
                    .style('y', '50%')
                    .style('dy', 25)
                    .style('fontSize', 38)
                    .style('fill', '#ec0909')
                    .style('textAlign', 'center');

                chartProportion2.render();

            })
            .catch(error => {
                console.error('Fetch Error:', error);
            });


        // 最早开始真实交易时间计算
        setTotalTradeTime(getDaysFromToday("2024-07-18"))

    }, [])

    /**
     * 距离当前时间多少天
     */
    function getDaysFromToday(dateStr) {
        // 将传入的日期字符串转换为 Date 对象
        const targetDate = new Date(dateStr);
        // 获取当前日期（不包含时间）
        const today = new Date();

        // 清除时间部分，只保留日期
        targetDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        // 计算两个日期之间的毫秒差
        const diffTime = today.getTime() - targetDate.getTime();

        // 转换为天数差（1天 = 24 * 60 * 60 * 1000 毫秒）
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays;
    }

    /**
     * 检索表格列数据
     */
    const onChange: TableProps['onChange'] = (pagination, filters, sorter, extra) => {
        console.log('params', pagination, filters, sorter, extra);
    };

    /**
     * 选择日期查询
     */
    const onDateOk = (value: DatePickerProps['value'] | RangePickerProps['value']) => {
        console.log('onOk: ', value);
    };

    /**
     * 新增交易数据表单
     */
    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const showDrawer = () => {
        setOpen(true);
    };

    const onClose = () => {
        setOpen(false);
    };

    /**
     * 根据日期查询星期几
     */
    const getWeekDay = (input: any) => {
        if (input == null || input == "") {
            return "";
        }
        let date;
        if (typeof input === 'string') {
            // 处理YYYY-MM-DD或YYYY/MM/DD格式
            const [year, month, day] = input.split(/[-/]/);
            date = new Date(Number(year), parseInt(month) - 1, Number(day));
        } else if (input instanceof Date) {
            date = input;
        } else {
            throw new Error('无效的日期格式');
        }

        const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        return days[date.getDay()];
    }

    return (
        <>
            <div className="app">
                <Badge.Ribbon color={'green'} text={'🚀 投资之旅 ' + totalTradeTime + '天'}>
                    <p className="title">总体交易投资盈亏统计总结 </p>
                </Badge.Ribbon>
                <Affix className={'affix'} offsetTop={10}>
                    <Space size={'large'}>
                        <Segmented<string>
                            options={['图表', '表格']}
                            size="large"
                            onChange={(value) => {
                                console.log(value) // string
                                if (value === '表格') {
                                    // 滚动到table锚点
                                    document.getElementById('tableList')?.scrollIntoView({behavior: 'smooth'})
                                } else {
                                    // 滚动top 0顶点
                                    document.getElementById('root')?.scrollIntoView({behavior: 'smooth'})
                                }
                            }}
                        />
                        <Segmented<string>
                            options={['日', '周', '月', '年']}
                            size="large"
                            onChange={(value) => {
                                //  console.log(value) // string
                                let dateData: any = jsonData;
                                switch (value) {
                                    case '日':
                                        break;
                                    case '周':
                                        // 获取最近一周数据
                                        dateData = dateData.filter((item: any) => {
                                            const date = new Date(item.endDate);
                                            const today = new Date();
                                            const oneWeekAgo = new Date();
                                            oneWeekAgo.setDate(today.getDate() - 7);
                                            return date >= oneWeekAgo && date <= today;
                                        });
                                        setJsonData(dateData);
                                        break;
                                    case '月':
                                        break;
                                    case '年':
                                        break;
                                }
                            }}
                        />
                        <RangePicker size={"middle"}
                                     format="YYYY-MM-DD"
                                     onChange={(value, dateString) => {
                                         console.log('Selected Time: ', value);
                                         console.log('Formatted Selected Time: ', dateString);
                                     }}
                                     onOk={onDateOk}/>
                        <Button color="danger" variant="solid" icon={<FlagOutlined/>}
                                onClick={showDrawer}>交易哲学</Button>
                        <Button color="purple" variant="solid" icon={<PayCircleOutlined/>}
                                href={window.location.href + "carey.html"}>凯利量化</Button>
                        <Button type="primary" icon={<PlusOutlined/>} onClick={showModal}>新增交易</Button>
                    </Space>
                </Affix>

                <Card variant="borderless">
                    <Row id={'totalProfit'} gutter={16}>
                        <Col span={3}>
                            <Statistic title="💸总盈利" valueStyle={{color: totalProfit > 0 ? '#3f8600' : "red"}}
                                       value={totalProfit} prefix={"$"} precision={1}/>
                            <span className={'tip'}> {totalProfit > 0 ? "盈利不狂喜自负" : "亏损不绝望怀疑"}</span>
                        </Col>
                        <Col span={3}>
                            <Statistic title="☀️总胜率" valueStyle={{color: winRate >= 40 ? '#3f8600' : "red"}}
                                       value={winRate} suffix="%"/>
                            <span className={'tip'}>最低盈亏比: {((100 - winRate) / winRate).toFixed(1)}</span>
                        </Col>
                        <Col span={3}>
                            <Statistic title="🏆总盈亏比"
                                       valueStyle={{color: averageProfitLossRatio >= 1 ? '#3f8600' : "red"}}
                                       value={averageProfitLossRatio} precision={1} suffix={" : 1"}/>
                            <span
                                className={'tip'}>最低胜率: {((1 / (Number(averageProfitLossRatio) + 1)) * 100).toFixed(1)}%</span>
                        </Col>
                        <Col span={3}>
                            <Statistic title="🚴最大单笔盈/亏" valueStyle={{color: '#3f8600'}}
                                       value={maxSingleProfit}
                                       precision={0} prefix={"$"}
                                       suffix={<span><span style={{color: 'black'}}> / </span> <span
                                           style={{color: 'red'}}>$ {maxSingleLoss}</span></span>}/>
                            <span className={'tip'}>盈亏不再牵动心跳</span>
                        </Col>
                        <Col span={3}>
                            <Statistic title="🤑平均单笔盈" valueStyle={{color: '#3f8600'}}
                                       value={profitTradeMoney / profitTradeNum} precision={1} prefix={"$"}/>
                            <span className={'tip'}>让利润奔跑 订单数: {profitTradeNum}</span>
                        </Col>
                        <Col span={3}>
                            <Statistic title="😢平均单笔亏" valueStyle={{color: 'red'}}
                                       value={lossTradeMoney / lossTradeNum} precision={1} prefix={""}/>
                            <span className={'tip'}>让亏损截断 订单数: {lossTradeNum}</span>
                        </Col>
                        <Col span={3}>
                            <Statistic title="💹ROE收益率" valueStyle={{color: totalProfit >= 0 ? '#3f8600' : "red"}}
                                       value={(totalProfit / 100) * 100} precision={1} suffix="%"/>
                            <span className={'tip'}>目标年化率: 30%</span>
                        </Col>
                        <Col span={3}>
                            <Statistic title="📃交易总订单" valueStyle={{color: 'blue'}}
                                       value={transactionsNum}/>
                            <span className={'tip'}>心中有规律 眼中无财富</span>
                        </Col>
                    </Row>
                </Card>
                <div id="container"></div>
                <Row gutter={12}>
                    <Col span={12}>
                        <div id="chartProportionContainer"></div>
                    </Col>
                    <Col span={12}>
                        <div id="chartProportionContainer2"></div>
                    </Col>
                </Row>
                <h3>交易计划与复盘日志</h3>
                <Table id={'tableList'} dataSource={jsonData} columns={columns} onChange={onChange}
                       pagination={{
                           position: ['bottomCenter'],
                           showSizeChanger: true,
                           showQuickJumper: true,
                       }}/>

                <Drawer
                    title="坚守的交易原则与哲学"
                    size={'large'}
                    closable={{'aria-label': 'Close Button'}}
                    onClose={onClose}
                    open={open}
                >
                    <List
                        itemLayout="horizontal"
                        dataSource={philosophyData}
                        renderItem={(item, index) => (
                            <List.Item>
                                <List.Item.Meta
                                    title={<a href={item.href}>{index + 1} . {item.title}</a>}
                                    description={item.description}
                                />
                            </List.Item>
                        )}
                    />
                </Drawer>

                <Modal title="新增交易记录" open={isModalOpen} onOk={handleOk} onCancel={handleCancel} okText={'保存'}>
                    <Form.Item label="商品">
                        <Input placeholder="交易商品名称"/>
                    </Form.Item>
                    <Form.Item label="买卖">
                        <Select
                            defaultValue="Buy"
                            style={{width: 90}}
                            options={[
                                {value: 'Buy', label: 'Buy'},
                                {value: 'Sell', label: 'Sell'},
                            ]}
                        />
                    </Form.Item>
                    <Form.Item label="手数">
                        <InputNumber placeholder="手数数量" min={0.01} max={100} defaultValue={0.01}/>
                    </Form.Item>
                    <Form.Item label="盈亏">
                        <InputNumber prefix={"$"}/>
                    </Form.Item>
                    <Form.Item label="时间">
                        <DatePicker/>
                    </Form.Item>
                    <Form.Item label="总结">
                        <TextArea rows={4} placeholder="交易总结内容 复盘经验" maxLength={200}/>
                    </Form.Item>
                </Modal>
                <FloatButton.BackTop/>
            </div>
        </>
    )
}

export default App
