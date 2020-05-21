<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片试图区 -->
    <el-card>
      <!-- 提示文字 -->
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>
      <!-- 步骤条 -->
      <el-steps :space="200" :active="activeIndex -0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- tabs导航栏 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        class="demo-ruleForm"
        label-position="top"
      >
        <el-tabs
          :tab-position="'left'"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
          v-model="activeIndex"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                expand-trigger="hover"
                v-model="addForm.goods_cat"
                :options="catelist"
                :props="catePorps"
                @change="handleChange"
                clearable
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" v-for="(cb,i) in item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              class="upload-demo"
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :on-success="handleSuccess"
              list-type="picture"
              :headers="headerObj"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <!-- 添加商品按钮 -->
            <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!--查看缩略图 -->
    <el-dialog title="查看图片" :visible.sync="imgdialogVisible" width="50%">
      <img :src="previewImg" alt class="previewImg" />
    </el-dialog>
  </div>
</template>
<script>
// 引入lodash
import _ from "lodash";
export default {
  data() {
    return {
      // 步骤条
      activeIndex: "0",
      // 添加商品数据源
      addForm: {
        goods_name: "",
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [],
        pics: [],
        goods_introduce: "", //商品的详情,
        attrs: [] //动态参数和静态属性
      },
      // 添加商品数据规则
      addFormRules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" }
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" }
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" }
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" }
        ],
        goods_cat: [
          { required: true, message: "请选择商品分类", trigger: "blur" }
        ]
      },
      // 级联选择器数据源
      catelist: [],
      // 级联选择器规则
      catePorps: {
        value: "cat_id",
        label: "cat_name",
        children: "children"
      },
      //商品参数
      manyTableData: [],
      //商品属性
      onlyTableData: [],
      //上传图片的URL地址
      uploadURL: "http://127.0.0.1:8888/api/private/v1/upload",
      //上传图片的请求头
      headerObj: {
        Authorization: window.sessionStorage.getItem("token")
      },
      //图片缩略图对话框
      imgdialogVisible: false,
      //图片缩略图展示的图片URL
      previewImg: ""
    };
  },
  methods: {
    // 获取级联选择器的数据
    async getCateList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200) {
        this.$message.error("网络错误！");
      } else {
        this.catelist = res.data;
      }
    },
    // 级联选择器选择时触发的事件
    handleChange() {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = [];
      }
      console.log(this.addForm.goods_cat);
    },
    // tabs栏切前触发的事件
    beforeTabLeave(activeName, oldActiveName) {
      if (activeName == 1 && this.addForm.goods_cat.length !== 3) {
        this.$message.error("请选择商品分类");
        return false;
      }
    },
    // tabs切换时触发的事件
    async tabClicked() {
      if (this.activeIndex == "1") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: "many" }
          }
        );
        if (res.meta.status !== 200) {
          this.$message.error("网络错误！");
        } else {
          res.data.forEach(item => {
            item.attr_vals =
              item.attr_vals.length == 0 ? [] : item.attr_vals.split(" ");
          });
          this.manyTableData = res.data;
          console.log(this.manyTableData);
        }
      } else if (this.activeIndex == "2") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: "only" }
          }
        );
        if (res.meta.status !== 200) {
          this.$message.error("网络错误！");
        } else {
          this.onlyTableData = res.data;
          console.log(this.onlyTableData);
        }
      }
    },
    // 上传图片查看缩略图的事件
    handlePreview(file) {
      // 将图片url传递给一个变量中
      this.previewImg = file.response.data.url;
      // 显示图片对话框
      this.imgdialogVisible = true;
    },
    // 上传图片移除事件
    handleRemove(file) {
      // 先把对应的tmp_path值获取到
      const filePath = file.response.data.tmp_path;
      // 然后再通过findIndex遍历是否有相等的tmp_path值，有的话就返回下标
      const index = this.addForm.pics.findIndex(item => {
        return item.pic == filePath;
      });
      // 再通过数组的方法把下表下的值给迪力特掉
      this.addForm.pics.splice(index, 1);
    },
    // 上传成功时
    handleSuccess(file) {
      // 拼接一个图片信息对象
      const picUrl = { pic: file.data.tmp_path };
      this.addForm.pics.push(picUrl);
    },
    // 添加商品
    async add() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          this.$message.error("请填写完必填项！");
        } else {
          // 由于发送数据是goods_cat，级联选择器的v-model值要改成字符串发送给服务器
          // 但级联选择器的v-model只能是数组不能改成字符串，不然会报错，此时
          // 可以给addForm做一层深拷贝，利用lodash
          // 将this.addForm的goods_cat参数从数组转换成,分隔的字符串
          const form = _.cloneDeep(this.addForm);
          form.goods_cat = form.goods_cat.join(",");
          //将动态参数和静态属性转换成对象形式
          //处理动态参数
          this.manyTableData.forEach(result => {
            const newInfo = {
              attr_id: result.attr_id,
              attr_value: result.attr_vals.join(" ")
            };
            this.addForm.attrs.push(newInfo);
          });
          //处理静态属性
          this.onlyTableData.forEach(result => {
            const newInfo = {
              attr_id: result.attr_id,
              attr_value: result.attr_vals
            };
            this.addForm.attrs.push(newInfo);
          });
          form.attrs = this.addForm.attrs;
          console.log(form);
          const { data: res } = await this.$http.post("goods", form);
          console.log(res);
          if (res.meta.status !== 201) {
            this.$message.error("添加商品列表失败，请稍后再试！");
          } else {
            this.$message.success("添加成功！");
            this.$router.push("/goods");
          }
        }
      });
    }
  },
  created() {
    this.getCateList();
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length == 3) {
        return this.addForm.goods_cat[2];
      } else {
        return null;
      }
    }
  }
};
</script>
<style lang="less" scoped>
.el-steps {
  margin: 10px;
}
.previewImg {
  width: 100%;
}
</style>