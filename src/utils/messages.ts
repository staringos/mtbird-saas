export const TEAM_NAME_CANNOT_EMPTY = "团队名称不能为空";
export const USERNAME_OR_PASSWORD_ERROR = "用户名或密码错误";
export const TEAM_EXISTS = "团队已存在";
export const TEAM_UPDATE_SUCCESS = "团队修改成功";
export const TEAM_DELETE_SUCCESS = "团队删除成功";
export const TEAM_DELETE_NO_AUTH = "无删除团队权限, 只有管理员才能删除团队";
export const APP_NO_TEAM_ID = "缺少团队ID";
export const APP_NO_APP_ID = "缺少应用ID";

export const PHONE_NUMBER_FORMAT_ERROR = "手机号格式错误";
export const VERIFY_CODE_ERROR = "验证码错误或已过期";
export const TEAM_ID_CANNOT_BE_NULL = "团队 ID 不能为空";

export const NO_AUTH = "没有权限";
export const OPERATION_SUCCESS = "操作成功";
export const NO_DATA = "未找到数据";
export const UPDATE_SUCCESS = "修改成功";
export const RESOURCE_NOT_FIND = "资源未找到";
export const PAGE_NOT_PUBLISH = "当前页面还未发布，请发布后重试";
export const SEND_SUCCESS = "发送成功";
export const PAGE_NOT_IN_APP = "应用内无此页面";
export const FORM_NOT_FIND = "表单未找到，该表单是否已在页面中被删除？";

export const ADMIN_HAS_TO_MANY_MP =
  "管理员绑定小程序超过限制，请更换管理员后重试";

export const PAGE_NO_HISTORY = "当前页面无版本信息";
export const PAGE_NO_PUBLISH = "当前页面未发布";
export const NO_APP = "无此应用或已删除";

export const EXTENSION_VERSION_EXISTS =
  "拓展版本已存在，请更新 manifest.json 中的插件版本(version)";
export const EXTENSION_NAME_NOT_EMPTY = "拓展名称不能为空";
export const EXTENSION_VERSION_NOT_EMPTY = "拓展名称不能为空";
export const USER_NO_AUTH =
  "用户未授权，请确认token是否正确，用户是否在团队内!";
export const TOKEN_NO_AUTH =
  "TOKEN错误，用户未授权，请确认token是否为拓展所在团队颁发，操作用户是否在团队内!";
export const UNKONWN_ERROR = "UNKONWN_ERROR";
export const EXTENSION_NOT_FIND = "拓展未找到";

export const INSTALL_BEFORE = "拓展已安装，不要重复安装";
export const INSTALL_SUCCESS = "安装成功!";
export const PARAMS_ERROR = "参数错误!";
export const PARAMS_NEEDED = "参数不全!";
export const THIS_VERSION_IS_LATEST = "当前版本已是最新的!";
export const EXTENSION_NOT_INSTALLED = "拓展未安装，或不可卸载";
export const EXTENSION_CANNOT_UNINSTALLED = "拓展不可卸载";

export const INVITE_FAILED_TRY_LATER = "邀请失败，请稍后重试或联系客服";
export const INVITE_FAILED_ALREADY_IN_TEAM = "邀请失败，成员已在团队中!";

export const PASSWORD_FORMAT_FAILED = "密码格式错误，不能小于八位";
export const NAME_CANNOT_BE_NULL = "名称不能为空";

export const TITLE_CANNOT_BE_NULL = "标题不能为空";

export const FIELD_CANNOT_REPEAT = "字段不能重复";

export const BIND_WX_FIRST = "用户未绑定微信";

export const APP_NOT_PUSH_MP = "当前应用为发布小程序";

export const WX_ERROR_PLEASE_CONTRACT = "微信调用错误，请联系管理员";

export const APP_NAME_NOT_SETUP = "应用名称未设置";
export const APP_DESC_NOT_SETUP = "应用描述未设置";
export const APP_AVATAE_NOT_SETUP = "应用头像未设置";

export const ORDER_REPEAT = "当前有在支付中订单，请支付或关闭后重试";
export const PRICE_NOT_MATCH = "价格计算错误，请联系客服!";
export const QUERY_USER_NOT_ORDER_USER = "当前用户非下单用户！";

export const ORDER_STATUS_ERROR = "当前订单状态错误";

export const NOT_PLATFORM_MANAGER = "权限不足，非平台管理员";

export const AI_LIMIT_EXCEEDED = "AI使用次数超出限制，请充值";
export const MP_NOT_EXISTS = "用户未绑定微信";

export const VERIFY_BETA_WEAPP_ERROR: Record<number, string> = {
  89249: "该appid已有转正任务执行中，距上次任务 24h 后再试",
  86004: "无效微信号",
  1004: "该微信用户违规命中黑名单",
  61070: "法人姓名与微信号不一致",
  89248: "企业代码类型无效，请选择正确类型填写",
  89255:
    "code参数无效，请检查code长度以及内容是否正确 ；注意code_type的值不同需要传的code长度不一样",
  1006: "该手机号违规命中黑名单",
  1003: "该appid的管理员绑定的账号数量达到上限，无法转正，可到公众平台安全助手进行解除绑定之后重试",
  1007: "该appid的管理员身份证绑定的账号数量达到上限，无法转正",
  1005: "该appid的管理员手机号绑定的账号数量达到上限，无法转正，可到公众平台安全助手进行解除绑定之后重试",
  1001: "该企业主体创建的小程序数量达到上限，无法转正",
  1002: "主体违规命中黑名单",
  91021: "不是没转正的试用小程序，不可以调这个接口",
  61069: "身份证号不正确。填写的身份证号信息需要与微信号的实名信息对应上",
  86019: "填写的企业信息和法人个人信息没对应上，请检查后重试",
};

export const SET_NAME_ERROR_CODE: Record<number, string> = {
  91001: "不是公众号快速创建的小程序",
  91002: "小程序发布后不可改名",
  91003:
    "改名状态不合法，小程序发布前可改名的次数为2次，请确认改名次数是否已达上限",
  91004: "昵称不合法",
  91005: "昵称 15 天主体保护",
  91006: "昵称命中微信号",
  91007: "昵称已被占用",
  91008: "昵称命中 7 天侵权保护期",
  91009: "需要提交材料",
  91010: "其他错误",
  91011: "查不到昵称修改审核单信息",
  91012: "其他错误",
  91013: "占用名字过多",
  91014: "+号规则 同一类型关联名主体不一致",
  91015: "指的是已经有同名的公众号，但是那个公众号的主体和当前小程序主体不一致",
  91016: "名称占用者 ≥2",
  91017: "+号规则 不同类型关联名主体不一致",
};
