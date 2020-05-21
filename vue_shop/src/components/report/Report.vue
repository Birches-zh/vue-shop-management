<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card>
      <!-- 2、将容器写出来 -->
      <div id="main" style="width: 600px;height:400px;"></div>
    </el-card>
  </div>
</template>
<script>
// 1、引入文件
import echarts from "echarts";
// 引入lodash合并对象
import _ from "lodash";
export default {
  data() {
    return {
      options: {
        title: {
          text: "用户来源"
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            label: {
              backgroundColor: "#E9EEF3"
            }
          }
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: "value"
          }
        ]
      }
    };
  },
  // 3、准备初始化，后面的都写在mounted里了
  async mounted() {
    var myChart = echarts.init(document.getElementById("main"));

    // 4、准备好配置项和数据
    const { data: res } = await this.$http.get("reports/type/1");
    if (res.meta.status !== 200) {
      this.$message.error("网络错误，请稍后再试！");
    } else {
      // 合并对象
     const result=  _.merge(this.options,res.data)
      // 5、使用刚指定的配置项和数据显示图表。
      myChart.setOption(result);
    }
  }
};
</script>
<style lang="less" scoped>
</style>