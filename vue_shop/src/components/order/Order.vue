<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <el-row>
        <el-col :span="6">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <el-table :data="orderlist" stripe border>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="order_number" label="订单编号"></el-table-column>
        <el-table-column prop="order_price" label="订单价格"></el-table-column>
        <el-table-column prop="pay_status" label="是否付款">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.pay_status ==='1'">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货">
          <template slot-scope="scope">
            <template>{{scope.row.is_send}}</template>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="下单时间">
          <template slot-scope="scope">{{scope.row.create_time|dataFormat}}</template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showBox"></el-button>
            <el-button type="success" icon="el-icon-location" size="mini" @click="showProgressBox"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页器 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-size="queryInfo.pagesize"
        :page-sizes="[3, 5, 10, 15]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>

      <!-- 修改地址对话框 -->
      <el-dialog
        title="修改地址"
        :visible.sync="addressVisible"
        width="50%"
        @close="addressDialogClosed"
      >
        <el-form
          :model="addressForm"
          :rules="addressFormRules"
          ref="addressFormRef"
          label-width="100px"
          class="demo-ruleForm"
        >
          <el-form-item label="省市区/县" prop="address1">
            <el-cascader expand-trigger="hover" :options="cityData" v-model="addressForm.address1"></el-cascader>
          </el-form-item>
          <el-form-item label="详细地址" prop="address2">
            <el-input v-model="addressForm.address2"></el-input>
          </el-form-item>
        </el-form>

        <span slot="footer" class="dialog-footer">
          <el-button @click="addressVisible = false">取 消</el-button>
          <el-button type="primary" @click="addressVisible = false">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 物流对话框 -->
      <el-dialog title="物流进度" :visible.sync="progressVisible" width="50%">
        <el-timeline>
          <el-timeline-item
            v-for="(activity, index) in progressInfo"
            :key="index"
            :timestamp="activity.time"
          >{{activity.context}}</el-timeline-item>
        </el-timeline>
      </el-dialog>
    </el-card>
  </div>
</template>
<script>
import citydata from "./citydata.js";
export default {
  data() {
    return {
      // 向服务器发送请求携带的数据
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10
      },
      // 数据总数量
      total: 0,
      // 订单管理的数据列表
      orderlist: [],
      // 修改地址对话框
      addressVisible: false,
      //  省市区/县的数据
      cityData: citydata,
      // 修改地址对话框表单数据源
      addressForm: {
        address1: [],
        address2: ""
      },
      // 修改地址对话框表单数据规则
      addressFormRules: {
        address1: [
          { required: true, message: "请选择省市区/县", trigger: "blur" }
        ],
        address2: [
          { required: true, message: "请输入详细地址", trigger: "blur" }
        ]
      },
      // 物流对话框
      progressVisible: false,
      // 物流数据源
      progressInfo: []
    };
  },
  methods: {
    // 向服务器获取订单列表数据
    async getOrderList() {
      const { data: res } = await this.$http.get("orders", {
        params: this.queryInfo
      });
      if (res.meta.status !== 200) {
        this.$message.error("网络请求超时！");
      } else {
        this.orderlist = res.data.goods;
        this.total = res.data.total;
      }
    },
    // 更改数据显示数量而触发的事件
    handleSizeChange(newPagesize) {
      this.queryInfo.pagesize = newPagesize;
      this.getOrderList();
    },
    // 更改当前页而出发的事件
    handleCurrentChange(newPagesnum) {
      this.queryInfo.pagenum = newPagesnum;
      this.getOrderList();
    },
    // 修改地址对话框
    showBox() {
      this.addressVisible = true;
    },
    // 关闭对话框触发的事件
    addressDialogClosed() {
      this.$refs.addressFormRef.resetFields();
    },
    // 显示物流对话框
    async showProgressBox() {
      const { data: res } = await this.$http.get("/kuaidi/1106975712662");
      if (res.meta.status !== 200) {
        this.$message.error("网络错误，请稍后再试！");
      } else {
        this.progressInfo = res.data;
        this.progressVisible = true;
      }
    }
  },
  created() {
    this.getOrderList();
  }
};
</script>
<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>