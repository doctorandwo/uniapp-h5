<template>
    <PageFrame class="page-index" :hasBack="true" bg="#f3f3f3" :hasHeader="true" title="隐私政策" head-background="#fff">
        <scroll-view class="scroll ly-flex-1" scroll-y :refresher-enabled="false" style="background: #fff">
            <!-- <rich-text :nodes="content"></rich-text> -->
            <view class="user-page">
                <view class="user-page__header">隐私政策</view>
                <view class="user-page__content">2021年12月22日版本</view>
                <view class="user-page__content">2021年12月22日生效</view>
                <view class="user-page__content"
                    >“{{ productName }}”是由{{ companyName }}（“我们”）运营的能够为您提供集运站管理的SaaS平台。本隐私政策适用于{{
                        productName
                    }}手机客户端、网页端、微信端和其他开放平台产品及服务。请您务必认真阅读本隐私政策，在确认充分了解并同意后使用{{
                        productName
                    }}。如果您不同意本隐私政策的任何内容，您应该立即停止使用{{ productName }}。<span class="user-pag-bold"
                        >当您开始使用{{ productName }}服务，即表示您已经同意我们按照本政策来收集、保存、使用、共享、保护您的个人信息。</span
                    ></view
                >
                <view class="user-page__title">我们个人信息安全投诉、举报、保护联系人：信息安全组</view>
                <view class="user-page__title">联系方式：{{ phone }}</view>
                <view class="user-page__title">本隐私政策帮助您了解以下内容：</view>
                <view class="user-page__list">1. 我们如何收集和使用个人信息</view>
                <view class="user-page__list">2. 我们如何使用Cookie及同类技术</view>
                <view class="user-page__list">3. 我们如何保存和保护您的个人信息</view>
                <view class="user-page__list">4. 我们如何进行个人信息的共享、转让、公开披露</view>
                <view class="user-page__list">5. 您的权利</view>
                <view class="user-page__list">6. 我们如何处理未成年人的个人信息</view>
                <view class="user-page__list">7. 您的个人信息如何在全球范围内转移</view>
                <view class="user-page__list">8. 本政策如何更新</view>
                <view class="user-page__list">9. 如何联系我们</view>
                <view class="user-page__content"
                    >我们致力于维持您对我们的信任，恪守以下原则，保护您的个人信息：权责一致原则、目的明确原则、选择同意原则、最小必要原则、确保安全原则、主体参与原则、公开透明原则等。我们也将按业界成熟的安全标准，采取相应的安全保护措施来保护您的个人信息。我们在您使用{{
                        productName
                    }}的过程中所收集到的个人信息将只用于本《隐私政策》中所规定的用途。如果超出本隐私政策说明的范围，我们会再次向您告知并征得您的明示同意。</view
                >
                <view class="user-page__content">
                    为给您带来更好的产品和服务体验，我们在持续努力改进我们的技术，随之我们可能会不时推出新的或优化后的功能，可能需要收集、使用新的<span class="user-pag-bold"
                        >个人信息或变更个人信息使用目的或方式。对此，我们将通过更新本隐私政策或通过弹窗或页面提示等方式向您说明对应个人信息的收集目的、范围及使用方式，并在征得您明示同意后收集、使用您的个人信息。</span
                    ></view
                >
                <view class="user-page__title">一、我们如何收集和使用个人信息</view>
                <view class="user-page__title">1. 个人信息的定义与范围</view>
                <view class="user-page__content">
                    1.1 个人信息，是指以电子或者其他方式记录的能够单独或者与其他信息结合识别自然人个人身份的各种信息。在本隐私政策中包括：
                    <text class="text-bold"
                        >姓名、手机号码、用户密码、身份信息、照片、面部识别特征、性别、年龄、征信信息、是否有犯罪记录、是否有不良行为记录、车辆信息、驾驶证、行驶证、常用地址、通讯地址、收货地址、位置信息、轨迹信息、录音录像、运单信息及交易状态、支付信息、提现记录、充值记录、银行卡号及其绑定手机号、评论信息、日志信息、设备信息、IP地址。</text
                    >
                </view>
                <view class="user-page__content">
                    1.2 个人敏感信息，是指一旦泄露、非法提供或滥用可能危害人身和财产安全，极易导致个人名誉、身心健康受到损害或歧视性待遇等的个人信息。在本隐私政策中包括：<text
                        class="text-bold"
                        >手机号码、用户密码、身份证或其他身份证明、面部识别特征、征信信息、驾驶证、位置信息、轨迹信息、录音录像、支付信息、提现记录、充值记录、银行卡号。</text
                    ></view
                >
                <view class="user-page__list"
                    >以上个人信息和个人敏感信息包含的内容分别与《个人信息安全规范》最新生效版本的附录A（资料性附录）-个人信息示例和附录B（资料性附录）-个人敏感信息判定的内容一致。</view
                >
                <view class="user-page__content"
                    >1.3 匿名化处理后的信息，即通过对个人信息的技术处理，使得个人信息主体无法被识别，且处理后不能被复原的信息，匿名化处理后的信息不属于个人信息。</view
                >
                <view class="user-page__content">1.4 其他无法识别特定自然人身份或者反映特定自然人活动情况的信息不属于个人信息。</view>

                <view class="user-page__title">2. 如何收集和使用个人信息</view>
                <view class="user-page__content">2.1 收集和使用您个人信息及相应的基本功能</view>
                <view class="user-page__content"
                    >我们的服务包括一些基础业务功能，该功能够帮助您使用我们的货物运输业务在线交易的功能，保障交易真实性及安全所必需的功能。我们需要收集、保存和使用下列与您有关的个人信息才能实现该等基础业务功能。如果您不提供相关信息，您将无法享受我们提供的服务，各项基本功能及其所需的个人信息类型如下：</view
                >
                <view class="user-page__content">(1) 用户注册所必要的信息</view>
                <view class="user-page__content">
                    如果您注册成为我们的用户，
                    <text class="text-bold">必须向我们提供您的用户名及手机号码，</text>
                    便于您成为我们的用户，我们在为您提供集运站管理服务时，{{ productName }}可能会通过短信或者电话方式向您发送或告知信息。如果您使用“微信登录”{{
                        productName
                    }}，我们还需要获取您在
                    <text class="text-bold">微信平台的OpenID </text>
                    我们以此识别您在{{ productName }}的网络身份，并为您提供{{ productName }}服务。如果您拒绝提供手机号码，您将无法成为{{ productName }}的注册用户，{{
                        productName
                    }}也将无法为您提供服务。
                </view>
                <view class="user-page__content">(2) 用户认证所必要的信息</view>
                <view class="user-page__content"
                    >如您选择使用我们的网络货物运输交易功能，依据法律法规，我们需要验证收集以下您的个人信息，用于验证您身份主体资格，保护您的财产安全及保障交易真实性，依据平台规则处理纠纷之需要。同时，为进行实名认证，您授权{{
                        productName
                    }}向第三方获取及保存您身份信息的验证结果。如果您拒绝提供以下信息，您将无法作为{{ productName }}的认证用户向其他用户提供服务。</view
                >
                <view class="user-page__content"
                    >a. 如果您是企业用户，必须向我们提供<text class="text-bold">企业名称、营业执照、法定代表人身份证照片、法定代表人手机号。</text></view
                >
                <view class="user-page__content"> b. 如果您是其他个人用户，必须向我们提供<text class="text-bold"> 姓名、身份证或其他身份证明、人脸信息。</text></view>
                <view class="user-page__content">如果您仅使用浏览网站等信息服务，您不需要成为我们的认证用户，也无需提供上述信息。</view>
                <view class="user-page__content">(3) 开展货物运输业务在线交易、管理、监控所必要的信息</view>
                <view class="user-page__content">
                    a.
                    <text class="text-bold"
                        >位置信息及轨迹信息。当您使用集运站管理服务时，我们会收集的您位置信息，以便您不需要手动输入地址坐标即可获得相关的位置服务。我们将通过您的终端设备、IP地址、GPS以及能够提供相关信息的其他传感器（如会为{{
                            productName
                        }}提供附近设备、Wi-Fi接入点和基站信息）或{{
                            productName
                        }}的定位功能来获取您的位置信息以及您的出发地、到达地、行驶轨迹、时长及里程数信息。我们收集您的位置信息及轨迹信息是基于法律法规及判断业务真实性的要求，是提供给货主查看货物运输情况、解决运输纠纷、自动为您推荐所在区域附近的加油/加气站，实现导航功能之必要的信息。</text
                    >
                    如果您拒绝我们获取您的位置信息及轨迹信息，可能导致我们无法为您提供基础业务功能。
                </view>
                <view class="user-page__content"
                    >b. 沟通信息。您通过{{ productName }}平台发送的
                    <text class="text-bold">语音、图片、文字信息</text>
                    及通过{{ productName }}平台拨打电话或与{{ productName }}客服对话时，{{ productName }}将通过信息记录的方式存储上述信息，以便用户向{{
                        productName
                    }}咨询、发生纠纷或者安全事故时，核实事实并处理相关投诉。如您拒绝{{ productName }}获取您与{{ productName }}之间的沟通信息，将导致您无法使用{{
                        productName
                    }}平台的信息功能，影响您及时与交易相对方取得联系。</view
                >
                <view class="user-page__content"> (4) 提供客服服务所必要的信息</view>
                <view class="user-page__content">
                    当您与{{
                        productName
                    }}客服团队联系时，为验证您的身份，帮你解决问题或记录相关问题咨询，反馈问题处理结果。我们会以通话录音及人工录入的方式记录及保存您的通话信息、您提出的意见或建议、
                    <text class="text-bold">您提供的姓名、联系方式，</text>
                    以便我们处理纠纷、解决问题或向您反馈结果。如果您拒绝我们收集此类信息，会导致您无法拨打我们的客服电话或客服团队无法将处理结果反馈到您，但不影响您使用{{
                        productName
                    }}基础业务功能。
                </view>
                <view class="user-page__content"> (7) 保障服务正常运行、保障交易安全所必要的信息</view>
                <view class="user-page__content">
                    为提高您使用我们及我们合作伙伴提供服务的安全性，确保操作环境安全与识别注册账号异常状态，更好地保护您或其他用户或公众的人身财产安全免遭侵害，更好地预防钓鱼网站、欺诈、网络漏洞、计算机病毒、网络攻击、网络侵入等安全风险，更准确地识别违反律法规或{{
                        productName
                    }}相关协议规则的情况，我们可能使用或整合您的
                    <text class="text-bold"
                        >设备信息（包括设备型号、操作系统版本、设备设置、MAC地址及IMEI、IDFA、OAID等设备标识符、SIM卡IMSI信息、SIM卡归属地、设备环境、移动应用列表等软硬件特征信息）及日志信息（包括浏览记录、检索内容、点击查看记录、交易记录以及IP地址、浏览器类型、电信运营商、使用语言、访问日期和时间）用户信息、交易信息、位置信息以及我们合作伙伴取得您授权或依据法律共享的信息，</text
                    >
                    来综合判断您账户及交易风险、进行身份验证、检测及防范安全事件，并依法采取必要的记录、审计、分析、处置措施。
                </view>
                <view class="user-page__content">2.2 您可选择是否授权我们收集和使用您的个人信息的情形</view>
                <view class="user-page__content"
                    >除上述基本业务功能我们会收集和使用您的个人信息外，我们的产品还包括一些扩展业务功能，如金融服务、购买保险、加油/加气、货车导航服务及我们页面上明确提示的由第三方提供的服务。我们可能会在您使用扩展业务功能时收集和使用您的个人信息，如果您不提供这些个人信息，您依然可以实现在线货物运输交易，但您可能将无法使用扩展业务功能：</view
                >
                <view class="user-page__content">
                    (1) 参与运营活动所必要的信息 您参加我们的运营活动时，我们需要您提供某些信息，可能会包含您的
                    <text class="text-bold">姓名、照片、通讯地址、联系方式、银行卡号、证照等活动所需信息。</text>
                    这些信息可以帮助我们对活动结果进行公示，对活动进行后续宣传，与您取得联系，向您发放礼品或转账。如果您拒绝提供此类信息，可能导致无法参加相应活动，或无法收到礼品、转账，但不会影响您使用{{
                        productName
                    }}基础业务功能。
                </view>
                <view class="user-page__content"
                    >(2) 其他用途 我们将您的个人信息用于本政策未载明的其他用途，或者将基于特定目的收集而来的你的个人信息用于其他目的时，会单独征求您的授权同意。</view
                >
                <view class="user-page__content">2.3 设备权限调用</view>
                <view class="user-page__content">
                    (1)
                    {{ productName }}平台可能会调用您的一些设备权限，以下是调用权限对应的业务功能、我们调用权限的目的，以及调用权限前向您询问的情况。</view
                >
                <view class="user-page__content">
                    (2) 您可以在设备的设置功能中选择关闭部分或全部权限，从而拒绝{{
                        productName
                    }}收集相应的个人信息。使用Android系统的不同设备中，权限显示方式及关闭方式可能有所不同，如果无法找到相应功能，可询问设备及系统的提供方获得帮助。</view
                >

                <view class="user-page__table">
                    <uni-table border emptyText="暂无数据">
                        <tbody>
                            <uni-tr>
                                <uni-td><b>设备权限</b></uni-td>
                                <uni-td><b>对应的业务功能</b></uni-td>
                                <uni-td><b>调用权限的目的</b></uni-td>
                                <uni-td><b>是否询问</b></uni-td>
                                <uni-td><b>用户可否关闭权限</b></uni-td>
                            </uni-tr>
                            <uni-tr>
                                <uni-td>定位</uni-td>
                                <uni-td>基础业务</uni-td>
                                <uni-td>记录当前考勤位置</uni-td>
                                <uni-td>首次弹框询问</uni-td>
                                <uni-td>是</uni-td>
                            </uni-tr>
                            <uni-tr>
                                <uni-td>读取手机状态和身份</uni-td>
                                <uni-td>基础服务</uni-td>
                                <uni-td>确定当前登录设备是否为用户常用使用设备，保护用户账户信息安全</uni-td>
                                <uni-td>否</uni-td>
                                <uni-td>是</uni-td>
                            </uni-tr>
                            <uni-tr>
                                <uni-td>多媒体访问</uni-td>
                                <uni-td>基础业务</uni-td>
                                <uni-td>上传头像，证件，票据等</uni-td>
                                <uni-td>首次弹框询问</uni-td>
                                <uni-td>是</uni-td>
                            </uni-tr>
                            <uni-tr>
                                <uni-td>摄像头</uni-td>
                                <uni-td>基础业务</uni-td>
                                <uni-td>上传头像，证件，票据等</uni-td>
                                <uni-td>首次弹框询问</uni-td>
                                <uni-td>是</uni-td>
                            </uni-tr>
                            <uni-tr>
                                <uni-td>通知</uni-td>
                                <uni-td>全部功能</uni-td>
                                <uni-td>接受消息</uni-td>
                                <uni-td>首次弹框询问</uni-td>
                                <uni-td>是</uni-td>
                            </uni-tr>
                            <uni-tr>
                                <uni-td>蜂窝数据和WLAN</uni-td>
                                <uni-td>全部功能</uni-td>
                                <uni-td>连接网络</uni-td>
                                <uni-td>否</uni-td>
                                <uni-td>是</uni-td>
                            </uni-tr>
                            <uni-tr>
                                <uni-td>读取文件权限</uni-td>
                                <uni-td>基础业务</uni-td>
                                <uni-td>应用升级，存储资源</uni-td>
                                <uni-td>首次弹框询问</uni-td>
                                <uni-td>是</uni-td>
                            </uni-tr>
                            <uni-tr>
                                <uni-td>读取SD卡权限</uni-td>
                                <uni-td>基础业务</uni-td>
                                <uni-td>应用升级，存储资源</uni-td>
                                <uni-td>首次弹框询问</uni-td>
                                <uni-td>是</uni-td>
                            </uni-tr>
                            <uni-tr>
                                <uni-td>读取手机识别码</uni-td>
                                <uni-td>基础业务</uni-td>
                                <uni-td>识别用户</uni-td>
                                <uni-td>否</uni-td>
                                <uni-td>是</uni-td>
                            </uni-tr>
                            <uni-tr>
                                <uni-td>获取用户的软件安装列表 </uni-td>
                                <uni-td>基础业务</uni-td>
                                <uni-td>判断用户是否安装地图应用</uni-td>
                                <uni-td>否</uni-td>
                                <uni-td>是</uni-td>
                            </uni-tr>
                        </tbody>
                    </uni-table>
                </view>

                <view class="user-page__title">2.4 以下情形，我们收集、使用您的个人信息，无需征得您授权同意：</view>
                <view class="user-page__content">(1) 与国家安全、国防安全有关的；</view>
                <view class="user-page__content">(2) 与公共安全、公共卫生、重大公共利益有关的；</view>
                <view class="user-page__content">(3) 与犯罪侦查、起诉、审判和判决执行等有关的；</view>
                <view class="user-page__content">(4) 出于维护个人信息主体或其他个人的生命、财产等重大合法权益但又很难得到本人同意的；</view>
                <view class="user-page__content">(5) 所收集的个人信息是个人信息主体自行向社会公众公开的；</view>
                <view class="user-page__content">(6) 从合法公开披露的信息中收集的您的个人信息的，如合法的新闻报道、政府信息公开等渠道；</view>
                <view class="user-page__content">(7) 根据您的要求签订合同所必需的</view>
                <view class="user-page__content">(8) 用于维护所提供的产品与/或服务的安全稳定运行所必需的，例如发现、处置产品与/或服务的故障；</view>
                <view class="user-page__content">(9) 为合法的新闻报道所必需的；</view>
                <view class="user-page__content"
                    >(10) 学术研究机构基于公共利益开展统计或学术研究所必要，且对外提供学术研究或描述的结果时，对结果中所包含的个人信息进行去标识化处理的；</view
                >
                <view class="user-page__content">(11) 法律法规规定的其他情形。</view>

                <view class="user-page__title">2.5 个人信息使用的规则</view>
                <view class="user-page__content">(1) 我们会根据本隐私政策的约定并为实现我们的产品与/或服务功能对所收集的个人信息进行使用。</view>
                <view class="user-page__content"
                    >(2)
                    在收集您的个人信息后，我们将通过技术手段对数据进行去标识化处理，去标识化处理的信息将无法识别主体。请您了解并同意，在此情况下我们有权使用已经去标识化的信息；并在不透露您个人信息的前提下，我们有权对用户数据库进行分析并予以商业化的利用。</view
                >
                <view class="user-page__content"
                    >(3)
                    请您了解并同意，您在使用我们的产品与/或服务时所提供的所有个人信息，除非您删除或通过系统设置拒绝我们收集，否则将在您使用我们的产品与/或服务期间持续授权我们使用。在您注销账号时，我们将停止使用并删除您的个人信息。</view
                >
                <view class="user-page__content"
                    >(4)
                    我们会对我们的产品与/或服务使用情况进行统计，并可能会与公众或第三方共享这些统计信息，以展示我们的产品与/或服务的整体使用趋势。但这些统计信息不包含您的任何身份识别信息。</view
                >
                <view class="user-page__content">(5) 当我们展示您的个人信息时，我们会采用包括内容替换、匿名处理方式对您的信息进行脱敏，以保护您的信息安全。</view>
                <view class="user-page__content"
                    >(6)
                    当我们要将您的个人信息用于本隐私政策未载明的其它用途时，或基于特定目的收集而来的信息用于其他目的时，会实现征求您的明示同意。请您理解，我们向您提供的产品与/或服务将不断更新变化。如果您选择使用本隐私政策中尚未列明的其他产品与/或服务时，我们会在收集您的个人信息前通过协议、页面提示等方式向您详细说明信息收集的目的、方式、范围并征求您的同意。若您不同意提供前述信息，您可能无法使用该项产品与/或服务，但不影响您使用现有产品与/或服务。</view
                >

                <view class="user-page__title"
                    >2.6 为保障{{
                        productName
                    }}APP相关功能的实现与应用的稳定运行，我们可能会接入第三方提供的软件开发包，以实现相关目的。关于第三方如何收集、使用您的个人信息保护政策，您可以通过链接查看第三方的信息收集使用和保护规则。请您查看{{
                        productName
                    }}APP涉及嵌入第三方代码、插件传输个人信息的情况说明</view
                >
                <view class="user-page__table">
                    <uni-table border emptyText="暂无数据">
                        <tbody>
                            <uni-tr>
                                <uni-td><b>SDK名称</b></uni-td>
                                <uni-td><b>第三方机构名称</b></uni-td>
                                <uni-td><b>收集及使用个人信息目的</b></uni-td>
                                <uni-td><b>收集个人信息的范围</b></uni-td>
                                <uni-td><b>隐私政策/官网链接</b></uni-td>
                            </uni-tr>
                            <uni-tr>
                                <uni-td>个推SDK</uni-td>
                                <uni-td>每日互动股份有限公司</uni-td>
                                <uni-td>收集应用使用情况,分析不同设备的表现,用以优化应用运行稳定性、用户使用体验、产品流程优化</uni-td>
                                <uni-td
                                    >唯一设备识别码（IMEI/Mac/android ID/IDFA/OPENUDID/GUID、SIM 卡 IMSI
                                    信息）以提供统计分析服务，并通过地理位置校准报表数据准确性,SDK/API/JS代码版本、浏览器、互联网服务提供商、平台、时间戳、应用标识符、应用程序版本、应用分发渠道、独立设备标识符、设备型号、传感器参数、终端制造厂商、终端设备操作系统版本等</uni-td
                                >
                                <uni-td>https://www.getui.com/privacy</uni-td>
                            </uni-tr>
                            <uni-tr>
                                <uni-td>高德SDK</uni-td>
                                <uni-td>高德软件有限公司</uni-td>
                                <uni-td>用于展现地图，实现定位、用于显现两点之间路径规划等功能</uni-td>
                                <uni-td>设备标识信息、位置信息</uni-td>
                                <uni-td>http://cache.amap.com/h5/h5/publish/238/index.html</uni-td>
                            </uni-tr>
                            <uni-tr>
                                <uni-td>阿里SDK</uni-td>
                                <uni-td>阿里云计算有限公司</uni-td>
                                <uni-td>根据相关法律法规的要求，需要通过人脸识别来进行实人认证</uni-td>
                                <uni-td>相册、摄像头、面部特征</uni-td>
                                <uni-td
                                    >http://terms.aliyun.com/legal-agreement/terms/suit_bu1_ali_cloud/suit_bu1_ali_cloud201902141711_54837.html?spm=5176.19720258.J_9220772140.87.6a492c4afJcY9W</uni-td
                                >
                            </uni-tr>
                            <uni-tr>
                                <uni-td>获取用户的软件安装列表 </uni-td>
                                <uni-td>基础业务</uni-td>
                                <uni-td>判断用户是否安装地图应用</uni-td>
                                <uni-td>否</uni-td>
                                <uni-td>是</uni-td>
                            </uni-tr>
                            <uni-tr>
                                <uni-td>腾讯SDK</uni-td>
                                <uni-td>腾讯科技（深圳）有限公司</uni-td>
                                <uni-td>提供用户错误日志收集</uni-td>
                                <uni-td>设备信息、位置信息、日志信息</uni-td>
                                <uni-td>http://bugly.qq.com/v2/contract</uni-td>
                            </uni-tr>
                            <uni-tr>
                                <uni-td>移动SDK</uni-td>
                                <uni-td>中国移动</uni-td>
                                <uni-td>提供一键登录</uni-td>
                                <uni-td>设备信息</uni-td>
                                <uni-td>http://dev.10086.cn/</uni-td>
                            </uni-tr>
                        </tbody>
                    </uni-table>
                </view>

                <view class="user-page__title">二、我们如何使用Cookie及同类技术</view>
                <view class="user-page__content">
                    1. Cookie是支持服务器端（或者脚本）在客户端上存储和检索信息的一种机制。当您使用{{
                        productName
                    }}产品或服务时，为使您获得更轻松安全的访问体验，我们可能会使用Cookie或同类技术来收集和存储信息，在此过程中可能会向您的设备发送一个或多个 Cookie
                    或匿名标识符。这么做是为了收取您的信息，用于了解您的偏好，进行咨询或数据分析，改善产品服务及用户体验，或及时发现并防范安全风险，为您提供更好的服务。我们不会将Cookie用于本政策所述目的之外的任何用途，您可根据自己的偏好留存或删除Cookie。您可清除软件内保存的所有Cookie，当您手动清除后您的相关信息即已删除。</view
                >
                <view class="user-page__content"
                    >2.
                    我们平台上还可能包含一些电子图像（以下简称“单像素GIF文件”或“网络Beacon”），使用网络Beacon可以计算浏览网页的用户或访问某些Cookie，我们会通过网络Beacon收集您浏览网页活动的信息，例如：Internet协议(IP)地址，浏览器类型，Internet服务提供商（ISP），参考/退出页面，操作系统，日期/时间戳，和点击数据流等。</view
                >

                <view class="user-page__title">三、我们如何保存和保护您的个人信息</view>
                <view class="user-page__title">1. 个人信息的保存</view>
                <view class="user-page__content">(1) 在用户使用{{ productName }}服务期间，我们会持续保存用户的个人信息。</view>
                <view class="user-page__content"
                    >(2)
                    当您自主删除个人信息或注销账户，我们将按照法律、法规规定的最短期限保留您的现有个人信息，在法律法规要求的最短保存期限内，我们将不再对您的个人信息进行商业化使用。当您的个人信息超出上述保存期限，我们将会对其进行匿名化处理。</view
                >
                <view class="user-page__content"
                    >a. 为配合人民检察院、公安机关、国家安全机关侦查用户使用{{
                        productName
                    }}服务过程中产生的犯罪行为，更好保护其他用户生命财产安全，当用户自主删除个人信息或注销账户，我们将在刑法规定的犯罪追诉时效期间内，加密隔离存档用户个人信息。</view
                >
                <view class="user-page__content"
                    >b. 如您使用{{ productName }}服务的过程中，存在严重违反法律法规、平台协议、平台规则等情形，您的违法、违约记录及相应的平台信用记录，将被永久保存。</view
                >
                <view class="user-page__content">c. {{ productName }}与您另行签署的具体的隐私协议就某类信息的保存期限做特殊约定的，从其约定。</view>

                <view class="user-page__title">2. 信息存放地域</view>
                <view class="user-page__content"
                    >我们收集的您的个人信息，将在中国内地存储和使用。如涉及向境外传输个人信息，我们将明确向您告知个人信息出境的目的、接收方、安全保障措施等情况，并另行征得您的同意。</view
                >

                <view class="user-page__title">3. 保护个人信息的措施</view>
                <view class="user-page__content">(1) 数据安全技术措施</view>
                <view class="user-page__content"
                    >我们已采取符合业界标准、合理可行的安全防护措施保护您提供的个人信息安全，防止个人信息遭到未经授权访问、公开披露、使用、修改、损坏或丢失。我们会使用加密技术（如TLS、AES等）、脱敏技术和匿名化技术提高个人信息的安全性；我们会使用受信赖的保护机制防止个人信息遭到恶意攻击；我们会部署访问控制机制，尽力确保只有授权人员才可访问个人信息；部署数据安全监控机制，尽力确保数据在数据生命周期（数据采集、存储、传输、使用、共享和销毁）中得到安全保障。在数据传输层面,为了保证用户的数据不被拦截、劫持,我们采用了TLS/SSL协议构建的可进行加密传输、身份认证的网络协议，主要通过数字证书、加密算法、非对称密钥等技术完成互联网数据传输加密，实现互联网传输安全保护。</view
                >
                <view class="user-page__content">(2) 其他安全措施：</view>
                <view class="user-page__content">a. 建立公司信息安全监管机制，指定信息安全负责人，统一协调管理公司的数据安全工作和推动各项数据安全活动。</view>
                <view class="user-page__content"> b. 公司内部颁布实施数据安全管理规范，明确对用户数据（包括用户个人信息）的保护标准和要求。</view>
                <view class="user-page__content">c. 新项目、新系统上线前对数据安全（包括用户个人信息数据）进行项目风险评估。</view>
                <view class="user-page__content">d. 与公司员工及服务外包人员签署保密协议，并严格按照工作职责分配数据访问权限。</view>
                <view class="user-page__content">e. 定期开展面向公司员工及外包服务人员的信息安全教育及培训。</view>

                <view class="user-page__title">4. 安全事件处置</view>
                <view class="user-page__content"
                    >(1)
                    为应对个人信息泄露、毁损、丢失等可能出现的安全风险，已经在公司范围内颁布多项制度，明确了安全事故、安全漏洞的分类分级标准，以及针对上述安全事故和漏洞，内部处理流程（包括应急响应流程）和补救措施。</view
                >
                <view class="user-page__content"
                    >(2)
                    由于信息网络正常的设备维护，信息网络连接故障，电脑、通讯、黑客、病毒或其他系统的故障，电力故障，罢工，暴乱，火灾，洪水，战争，政府行为，司法行政机关的命令等不可抗力行为或第三方的不作为有可能导致{{
                        productName
                    }}获取和存储的用户隐私信息泄露，除非{{ productName }}故意泄露您的隐私信息，否则{{
                        productName
                    }}不承担任何责任。一旦发生安全事件，我们将及时向您告知事件基本情况和风险、我们已经采取或将要采取的措施、您如何自行降低风险的建议等。</view
                >
                <view class="user-page__content"
                    >(3)
                    {{
                        productName
                    }}会采用符合业界标准的安全防护措施，按照现有技术使用相应的安全技术和程序，提供合理的安全保障，在任何时候尽力做到使您的隐私信息不被泄露、毁损、丢失、不当使用、未经授权阅览或披露。</view
                >
                <view class="user-page__content"
                    >(4) 您负责对登录账号及密码的保管及保密，对在该登录账号及密码下发生的所有行为承担责任。您应以正确的步骤离开{{
                        productName
                    }}，一旦发现任何人未经授权使用其您名和密码，应立即通知{{ productName }}并提供相应的证明。{{
                        productName
                    }}将在合理时间内根据审查结果做出应对措施，在采取相应措施之前，您应对已经产生的后果、损失自行承担责任。{{
                        productName
                    }}将通过对用户密码进行加密等安全措施来防止前述信息不丢失、不被滥用和变造。尽管有前述安全措施，但同时也请您注意在信息网络上不存在“完善的安全措施”。</view
                >
                <view class="user-page__content"
                    >(5) 我们将及时以推送通知、信函或电话等方式将安全事件情况通知受影响的用户。当难以逐一告知用户时，我们将通过发布平台公告的方式发布警示信息。</view
                >
                <view class="user-page__content"
                    >(6) 为了保护您的信息安全，如果用户个人信息有误，{{ productName }}会在严格验证并核实申请人身份后，根据用户要求访问、修正或删除相关信息（除非{{
                        productName
                    }}处于合法的原因而必须保留这些个人信息）。</view
                >

                <view class="user-page__title">5. 停止运营</view>
                <view class="user-page__content">(1) 如{{ productName }}停止运营，我们将至少提前30日在{{ productName }}发布公告，并及时停止收集个人信息。</view>
                <view class="user-page__content"
                    >(2)
                    停止运营后，我们将停止对个人信息的商业化使用，并在满足法律法规规定的最短保存期后，对收集的个人信息进行匿名化处理或者按照相关法律法规的要求删除您的个人信息。</view
                >

                <view class="user-page__title">四、个人信息的共享、转让、公开披露</view>
                <view class="user-page__title"> 1. 共享</view>
                <view class="user-page__content"
                    >(1) 共享是指{{ productName }}向其他个人信息控制者提供个人信息，且双方分别对个人信息拥有独立控制权的过程。{{
                        productName
                    }}不会对外共享您的个人信息，但以下情况除外：</view
                >
                <view class="user-page__content">a. 实现本政策所述为实现{{ productName }}基本业务功能必须收集的信息所述目的，只有共享您的个人信息，才能提供您所需要的服务；</view>
                <view class="user-page__content">b. 在获取明确同意情况下的共享：获得您的明确同意后，{{ productName }}会向您指定的第三方共享您授权范围内的信息。</view>
                <view class="user-page__content"
                    >c. 在法定情形下的共享：{{ productName }}可能会根据法律法规规定、诉讼争议解决需要，或按行政、司法机关依法提出的要求，对外共享您的个人信息。</view
                >
                <view class="user-page__content">
                    d. 共享给{{ productName }}的关联公司：您的信息可能会在{{ productName }}的关联公司内共享。例如，
                    <text class="text-bold">对于使用同一套账户体系的业务，我们会在关联公司内共享您的账户信息（账户、密码及其他用户基础资料 ；</text>
                    出于维护平台秩序、保护平台或其他用户合法权利的需要，我们会在关联公司内共享用户违法、违约、违反平台规则的行为。我们只会共享必要的个人信息，且受本隐私政策中所声明目的的约束，如果我们共享您的个人敏感信息或关联公司改变个人信息的使用及处理目的，将再次征求您的授权同意。
                </view>
                <view class="user-page__content"
                    >(2) 共享给业务合作伙伴：{{
                        productName
                    }}可能会向合作伙伴等第三方共享您的个人信息，以保障为您提供的服务顺利完成。但我们仅会出于合法、正当、必要、特定、明确的目的共享您的个人信息，并且只会共享提供服务所必要的个人信息。我们的合作伙伴包括：</view
                >
                <view class="user-page__content"
                    >a. 您通过{{ productName }}使用第三方服务时，{{ productName }}会按照“个人信息的收集”条款列明的共享内容与提供服务的第三方共享您的个人信息。</view
                >
                <view class="user-page__content"
                    >b.
                    广告、分析服务类的授权合作伙伴。我们会委托这些合作伙伴处理与广告覆盖面和有效性相关的信息，但不会提供您的个人身份信息，或者我们将这些信息进行去标识化处理，以便它不会识别您个人。这类合作伙伴可能将上述信息与他们合法获取的其他数据相结合，以执行我们委托的广告服务或决策建议。</view
                >
                <view class="user-page__content"
                    >c. 如果您通过{{ productName }}参加第三方举办或者{{ productName }}与第三方联合举办的营销、推广活动，{{ productName }}需要与第三方共享您的姓名、 手机号码
                    、收货地址、 银行卡号 或者其他必要的信息，以方便第三方统计活动参与情况、获奖情况，为您绑定您获取的优惠券、发放权益、邮寄您获取的奖品等。</view
                >
                <view class="user-page__content">
                    d. 供应商、服务提供商或其他合作伙伴。{{ productName }}可能会将您的个人信息共享给支持我们功能的第三方，包括为我们提供
                    <text class="text-bold"
                        >基础设施技术服务、实名验证服务及其他身份验证服务、OCR识别服务、消息推送服务、短信运营服务、人脸识别服务、支付服务、数据处理服务、金融服务、开通电子账户的银行、电子签名认证机构及提供位置数据服务的第三方
                    </text>
                    等。我们共享这些信息的目的是为实现产品及服务的功能，比如我们需要将您
                    <text class="text-bold">的姓名和身份证号</text>
                    共享给实名验证服务供应商，以进行实名验证；或者我们需要与人脸识别供应商共享您的
                    <text class="text-bold">面部识别特征及姓名、身份证号 </text>
                    ，以识别您是否本人使用服务；或者我们需要将您的运单号和运单金额与合作银行、第三方支付机构共享以实现其确认您的支付指令并完成支付等。
                </view>
                <view class="user-page__content"
                    >{{
                        productName
                    }}会与共享个人信息的公司、组织和个人签署保密协议或包含保密条款的协议，要求他们严格按照本政策声明的目的使用个人信息以及采取相关的保密和安全措施来处理个人信息。</view
                >
                <view class="user-page__content"
                    >(3) 为维护用户合法权益，在协助处理与您有关的交易纠纷或争议时，我们可能向您的交易相对方或存在利害关系的第三方提供解决交易纠纷或争议所必需的信息。</view
                >
                <view class="user-page__content"
                    >(4) 我们将遵守相关法律法规，对您的个人信息予以保密。除非事先获得您的明确同意或授权，或依照法律规定所必须，我们不会公开披露您的个人信息。</view
                >

                <view class="user-page__title">2. 转让</view>
                <view class="user-page__content">我们不会将您的个人信息转让给任何公司、组织和个人，但以下情况除外：</view>
                <view class="user-page__content">(1) 在获取明确同意的情况下转让：获得您的明确同意后，我们会向其他方转让您的个人信息；</view>
                <view class="user-page__content">(2) 根据适用的法律法规、法律程序的要求、强制性的行政或司法要求所必须的情况进行提供；</view>
                <view class="user-page__content">(3) 符合与您签署的相关协议（包括在线签署的电子协议以及相应的平台规则）或其他的法律文件约定所提供；</view>
                <view class="user-page__title"
                    >(4)
                    在涉及合并、收购、资产转让或类似的交易时，如涉及到个人信息转让，我们会要求新的持有您个人信息的公司、组织继续受本隐私政策的约束，否则,我们将要求该公司、组织重新向您征求授权同意。</view
                >

                <view class="user-page__title">3.公开披露</view>
                <view class="user-page__content">我们仅会在以下情况下，才会公开披露您的个人信息：</view>
                <view class="user-page__title">(1) 获得您明确同意或基于您的主动选择，我们可能会公开披露您的个人信息；</view>
                <view class="user-page__title"
                    >(2)
                    根据法律、法规的要求、强制性的行政执法或司法要求所必须提供您个人信息的情况下，我们可能会依据所要求的个人信息类型和披露方式公开披露您的个人信息。在符合法律法规的前提下，当我们收到上述披露信息的请求时，我们会要求必须出具与之相应的法律文件，如传票或调查函。我们坚信，对于要求我们提供的信息，应该在法律允许的范围内尽可能保持透明。我们对所有的请求都进行了慎重的审查，以确保其具备合法依据，且仅限于执法部门因特定调查目的且有合法权利获取的数据。在法律法规许可的前提下，我们披露的文件均在加密密钥的保护之下。</view
                >

                <view class="user-page__title">五、您的权利</view>
                <view class="user-page__title">1. 访问个人信息</view>
                <view class="user-page__content">您可以通过{{ productName }}平台访问您的个人信息，包括注册信息、运单信息、交易记录、账户信息等。</view>

                <view class="user-page__title">2. 更正个人信息</view>
                <view class="user-page__content"
                    >您可以在{{
                        productName
                    }}平台更正您的手机号码、用户密码、照片、常用地址、通讯地址、收货地址、银行卡号及其绑定手机号、名称、联系电话、管理员信息、发票信息等信息。如您需要更正姓名、身份信息、面部识别特征、性别、年龄、驾驶证、从业资格证的信息，请随时联系我们。我们会根据本隐私政策所列明的方式和期限响应您的请求。</view
                >
                <view class="user-page__content"
                    >除上述列明的信息外，您的部分个人信息我们还无法为您提供访问和更正的服务，这些信息主要是为了提升您的用户体验和保证交易安全所收集的您的设备信息、您使用附加功能时产生的非您主动提交的个人信息。上述信息我们会在您的授权范围内进行使用，您无法访问和更正，但您可联系我们进行删除或做匿名化处理。</view
                >

                <view class="user-page__title">3.删除个人信息</view>
                <view class="user-page__content"
                    >您可以在{{ productName }}平台删除您的评论信息、已关闭的货源信息、平台推送的信息、录音录像等信息。在以下情形中，您可以向我们提出删除个人信息的请求：</view
                >
                <view class="user-page__content">(1) 如果我们处理个人信息的行为违反法律法规；</view>
                <view class="user-page__content">(2) 如果我们收集、使用您的个人信息，却未征得您的同意；</view>
                <view class="user-page__content">(3) 如果我们处理个人信息的行为违反了与您的约定；</view>
                <view class="user-page__content">(4) 如果您注销了{{ productName }}账户；</view>
                <view class="user-page__content">(5) 如果我们终止服务及运营。</view>
                <view class="user-page__content"
                    >若我们决定响应您的删除请求，我们还将同时通知从我们获得您的个人信息的实体，要求其及时删除，除非法律法规另有规定，或这些实体获得您的独立授权。当您从我们的服务中删除信息后，我们可能不会立即备份系统中删除相应的信息，但会在备份更新时删除这些信息。</view
                >

                <view class="user-page__title">4. 撤回同意</view>
                <view class="user-page__content">我们将通过以下方式保障用户撤回同意的权利：</view>
                <view class="user-page__content">a. {{ productName }}平台发送的商业广告信息中，会向您说明具体退订方式，您可以按照信息中说明的退订方式撤回同意。</view>
                <view class="user-page__content"
                    >b. 您可以通过设备的设置功能，关闭相应设备权限（包括位置、通讯录、照片、麦克风、相机、通知等），撤回对{{ productName }}获取您个人信息的授权。</view
                >
                <view class="user-page__content"
                    >c.
                    您还可以通过解除银行卡绑定、删除信息等方式撤回部分授权。当您撤回同意或授权后，可能导致我们无法为您继续提供撤回授权部分对应的服务。但您撤回同意或授权，不影响撤回前基于您的同意开展的个人信息处理。</view
                >

                <view class="user-page__title">5. 注销个人账户</view>
                <view class="user-page__title"
                    >(1) 您有权注销您的{{ productName }}账户。你可在清空钱包余额和电话联系{{ productName }}客服
                    {{ phone }} 提交注销申请，您的注销申请将在15个工作日内完成处理。</view
                >
                <view class="user-page__title"
                    >(2) 除法律法规另有规定外，注销账户后{{
                        productName
                    }}将停止为您提供服务，并在满足法律法规要求的最短保存期限要求的情况下，对您的个人信息进行删除或匿名化处理，且不再对您的个人信息进行商业化使用。</view
                >

                <view class="user-page__title">6. 响应您的上述请求</view>
                <view class="user-page__content"
                    >对于您合理的请求，我们原则上不收取费用，但对多次重复、超出合理限度的请求，我们将视情收取一定成本费用。对于那些无端重复、需要过多技术手段（例如，需要开发新系统或从根本上改变现行惯例）、给他人合法权益带来风险或者非常不切实际（例如，涉及备份磁带上存放的信息）的请求，我们可能会予以拒绝。在以下情形中，按照法律法规要求，我们将无法响应您的请求：</view
                >
                <view class="user-page__title">(1) 与国家安全、国防安全直接相关的；</view>
                <view class="user-page__title">(2) 与公共安全、公共卫生、重大公共利益直接相关的；</view>
                <view class="user-page__title">(3) 与犯罪侦查、起诉、审判和判决执行等直接相关的；</view>
                <view class="user-page__title">(4) 有充分证据表明您存在主观恶意或滥用权利的；</view>
                <view class="user-page__title">(5) 响应您的请求将导致您或其他个人、组织的合法权益受到严重损害的。</view>
                <view class="user-page__title">(6) 涉及商业秘密的。</view>

                <view class="user-page__title">六. 我们如何处理儿童的个人信息</view>
                <view class="user-page__content"
                    >1.
                    我们的产品、网站和服务主要面向成人。如果没有父母或监护人的同意，未成年人不得创建自己的用户账户。对于经父母或监护人同意而收集未成年个人信息的情况，我们只会在受到法律允许、父母或监护人明确同意或者保护未成年人所必要的情况下使用或公开披露此信息。</view
                >
                <view class="user-page__content">2. 尽管当地法律和习俗对未成年人的定义不同，但我们将不满18周岁的任何人均视为未成年人。</view>
                <view class="user-page__content">3. 如果我们发现自己在未事先获得可证实的父母同意的情况下收集了未成年人的个人信息，则会设法尽快删除相关数据。</view>
                <view class="user-page__content">4. 如您为未成年人的父母或监护人，当您对您所监护的未成年人的信息处理存在疑问时，请通过上文中的联系方式联系我们。</view>

                <view class="user-page__title">七、您的个人信息如何在全球范围内转移</view>
                <view class="user-page__title">原则上，我们在中华人民共和国境内运营中收集和产生的个人信息，将存储在中华人民共和国境内，以下情形除外：</view>
                <view class="user-page__title">(1) 适用的法律有明确规定；</view>
                <view class="user-page__title">(2) 获得您的明确授权；</view>
                <view class="user-page__title">(3) 您通过互联网进行跨境交易等个人主动行为。</view>
                <view class="user-page__title">针对以上情形，我们会确保依据本隐私政策对您的个人信息提供足够的保护。</view>

                <view class="user-page__title">八. 本政策如何更新</view>
                <view class="user-page__content">1. 如{{ productName }}平台发生以下变化，我们将及时对本隐私政策进行相应的修订：</view>
                <view class="user-page__content">(1) {{ productName }}平台业务功能发生变更；</view>
                <view class="user-page__content">(2) 用户个人信息保存地域发生变更；</view>
                <view class="user-page__content">(3) 用户个人信息的使用规则发生变更；</view>
                <view class="user-page__content">(4) 我们的联络方式及投诉渠道发生变更；</view>
                <view class="user-page__content">(5) 发生其他可能影响用户个人信息安全或影响用户隐私权利的变更等。</view>
                <view class="user-page__content"
                    >2. 隐私政策修订后，我们会在{{ productName }}平台发布最新版本，并以推送通知或者平台公示的方式告知用户，以便用户及时了解最新版本隐私政策。</view
                >
                <view class="user-page__content">3. 未经您的明确同意，我们不会削减您按照本隐私政策所享有的权利。</view>
                <view class="user-page__content"
                    >4.
                    为了您能及时接收到通知，建议您在联系方式更新时及时通知我们。如您在本政策更新生效后继续使用我们的服务，即代表您已充分阅读、理解并接受更新后的政策并愿意受更新后的政策约束。我们鼓励您在每次使用我们服务时都查阅本政策。您可以在我们的产品和服务中可通过{{
                        productName
                    }}平台中查看本政策。</view
                >

                <view class="user-page__title">九. 如何联系我们</view>
                <view class="user-page__content">1. 您可以通过客服电话（ {{ phone }} ）与{{ productName }}的客服团队取得联系，反馈您的意见或投诉。</view>
                <view class="user-page__content"
                    >2. 如果您对本隐私政策的任意内容，有任何的疑问、意见或建议，或者无法准确理解{{ productName }}对条款的解释，请通过{{ productName }}客服渠道进行询问（客服热线：
                    {{ phone }} ，{{ productName }}安排客服人员值班答疑。</view
                >
                <view class="user-page__title">3. {{ productName }}运营者为{{ companyName }}，注册地址为{{ address }}。</view>
                <view class="user-page__content">
                    4.
                    一般情况下，我们将在十五天内回复。如果您对我们的回复不满意，特别是我们的个人信息处理行为损害了您的合法权益，您还可以向网信、电信、公安及工商等监管部门进行投诉或举报，或
                    <text class="text-bold">通过向被告住所地有管辖权的法院提起诉讼来寻求解决方案。</text>
                </view>

                <view style="margin-bottom: 100rpx"></view>
            </view>
        </scroll-view>
    </PageFrame>
</template>

<script>
import PageFrame from '@/pages/components/PageFrame/index.vue';
// import { ApiGetContentDetail } from '@/pages_login/section';
import useRequest from '@zerone/toolbox/packages/hooks/useRequest';
import UniTable from './components/uni-table_1.2.2/components/uni-table/uni-table.vue';
import UniTr from './components/uni-table_1.2.2/components/uni-tr/uni-tr.vue';
import UniTd from './components/uni-table_1.2.2/components/uni-td/uni-td.vue';

export default {
    components: { PageFrame, UniTable, UniTr, UniTd },
    data() {
        return {
            content: '隐私政策',
            productName: this.$ui.brand.name, // @by oh-my-zerone 2026-10-08
            companyName: this.$ui.brand.company, // @by oh-my-zerone 2026-10-08
            phone: this.$ui.brand.servicePhone, // @by oh-my-zerone 2026-10-08
            address: this.$ui.brand.companyAddress, // @by oh-my-zerone 2026-10-08
        };
    },
    mounted() {
        // this.getDetail();
    },
    methods: {
        async getDetail() {
            const [err, res] = await useRequest(ApiGetContentDetail, this.contentId);
            if (err) return;
            const { content } = res.data;
            this.content = content;
        },
    },
};
</script>

<style lang="scss" scoped>
@import '@/pages/style.scss';
.scroll {
    padding-top: 20rpx;
    padding-bottom: 20rpx;
    box-sizing: border-box;
}

.user-page {
    height: 100%;
    padding: 0 60rpx;
    background: #fff;
    color: #444;
    overflow-y: auto;
    // padding-top: 130upx;
    &__header {
        text-align: center;
        font-size: 36rpx;
        font-weight: bold;
        line-height: 100rpx;
        color: #333;
    }
    &__title {
        font-size: 28rpx;
        font-weight: 700;
        margin: 30rpx 0;
    }
    &__content {
        margin: 20upx 0;
        font-size: 28rpx;
        text-indent: 2em;
        line-height: 40rpx;
        word-break: break-all;
    }
    &__list {
        margin: 20upx 0;
        font-size: 28rpx;
        line-height: 40rpx;
        word-break: break-all;
    }
    &__table {
        font-size: 26rpx;
        font-weight: normal;
        line-height: 40rpx;
        margin: 30rpx 0;
        .table--border,
        .uni-table-td {
            border-color: #606266;
        }
        .uni-table-td {
            min-width: 100rpx;
            padding: 10rpx 12rpx;
            text-align: center !important;
            word-break: break-all;
        }
    }
    .user-pag-bold {
        font-weight: bold;
    }
    .text-bold {
        font-weight: bold;
    }
}
</style>
