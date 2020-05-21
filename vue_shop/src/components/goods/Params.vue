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
      <!-- 警告窗口 -->
      <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" show-icon :closable="false"></el-alert>
      <!-- 级联选择器 -->
      <el-cascader
        expand-trigger="hover"
        :options="cateList"
        :props="cateProps"
        v-model="selectedCateKeys"
        @change="handleChange"
        clearable
      ></el-cascader>
      <!-- 标签页 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 动态参数 -->
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加参数按钮 -->
          <el-button
            type="primary"
            size="mini"
            @click="showAddCateDialog"
            :disabled="btnDisabled"
          >添加动态参数</el-button>
          <!-- 表格 -->
          <el-table :data="manyTableData" border stripe>
            <el-table-column type="expand">
              <!-- 小标签 -->
              <template slot-scope="scope">
                <el-tag
                  :key="i"
                  v-for="(item,i) in scope.row.attr_vals"
                  closable
                  @close="handleClose(i,scope.row)"
                >{{item}}</el-tag>
                <!-- 输入框 -->
                <el-input
                  class="input-new-tag"
                  v-if="inputVisible"
                  v-model="inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                  v-focus
                ></el-input>
                <!-- 按钮 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditCateDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 静态属性 -->
        <el-tab-pane label="静态属性" name="only">
          <!-- 添加参数按钮 -->
          <el-button
            type="primary"
            size="mini"
            @click="showAddCateDialog"
            :disabled="btnDisabled"
          >添加静态属性</el-button>
          <!-- 表格 -->
          <el-table :data="onlyTableData" border stripe>
            <el-table-column type="expand"></el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditCateDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加对话框 -->
    <el-dialog
      :title="this.activeName == 'many'? '添加动态参数' : '添加静态属性'"
      :visible.sync="addCateDialogVisible"
      width="50%"
    >
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="添加分类" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑对话框 -->
    <el-dialog
      :title="this.activeName == 'many'? '修改动态参数' : '修改静态属性'"
      :visible.sync="editCateDialogVisible"
      width="50%"
    >
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item :label="this.activeName == 'many'? '动态参数' :'静态属性'" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 级联选择器数据源
      cateList: [],
      // 级联选择器规则
      cateProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children"
      },
      // 级联选择器输出结果
      selectedCateKeys: [],
      // tabs栏切换
      activeName: "many",
      // 表格数据源
      manyTableData: [],
      onlyTableData: [],
      // 添加对话框
      addCateDialogVisible: false,
      // 修改对话框
      editCateDialogVisible: false,
      // 添加分类数据源
      addForm: {
        attr_name: ""
      },
      // 添加对话框数据源规则
      addFormRules: {
        attr_name: [
          { required: true, message: "请输入参数名称", trigger: "blur" }
        ]
      },
      // 修改分类数据源
      editForm: {},
      // 添加对话框数据源规则
      editFormRules: {
        attr_name: [
          { required: true, message: "请输入参数名称", trigger: "blur" }
        ]
      },
      // 小标签输入框
      inputVisible: false,
      inputValue: ""
    };
  },
  methods: {
    // 获取级联选择器需要的数据
    async getCateList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200) {
        return this.$message.error("获取数据失败，请稍再试！");
      } else {
        this.cateList = res.data;
      }
    },
    // 级联选择器监听事件
    handleChange() {
      this.getParamsData();
    },
    // tabs栏切换的点击事件
    handleTabClick(tab, event) {
      this.getParamsData();
    },
    // 获取分类参数列表
    async getParamsData() {
      if (this.selectedCateKeys.length !== 3) {
        // 不等于3证明没有三级分类
        this.selectedCateKeys = [];
        this.manyTableData = [];
        this.onlyTableData = [];
        return;
      }
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName }
        }
      );
      if (res.meta.status !== 200) {
        this.$message.error("网络请求错误！");
      } else {
        // 把attr_vals的值循环遍历并且修改成数组
        res.data.forEach(result => {
          result.attr_vals = result.attr_vals
            ? result.attr_vals.split(" ")
            : [];
        });
        if (this.activeName == "many") {
          this.manyTableData = res.data;
          console.log(this.manyTableData);
        } else {
          this.onlyTableData = res.data;
          console.log(this.onlyTableData);
        }
      }
    },
    // 显示添加对话框
    showAddCateDialog() {
      this.addCateDialogVisible = true;
    },
    //添加动态参数或静态属性
    async addParams() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return;
        } else {
          const { data: res } = await this.$http.post(
            `categories/${this.cateId}/attributes`,
            {
              attr_name: this.addForm.attr_name,
              attr_sel: this.activeName
            }
          );
          if (res.meta.status !== 201) {
            return this.$message.error("添加参数失败，请稍后再试！");
          } else {
            this.$message.success("添加参数成功！");
            this.getParamsData();
            this.addCateDialogVisible = false;
          }
        }
      });
    },
    // 修改对话框
    async showEditCateDialog(attr_id) {
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attr_id}`,
        {
          params: {
            attr_sel: this.activeName
          }
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("读取数据失败，请稍后再试！");
      } else {
        this.editForm = res.data;
        this.editCateDialogVisible = true;
      }
    },
    // 修改分类
    editCate() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
          return;
        } else {
          const { data: res } = await this.$http.put(
            `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
            {
              attr_name: this.editForm.attr_name,
              attr_sel: this.activeName
            }
          );
          if (res.meta.status !== 200) {
            this.$message.error("数据更新失败，请稍后再试！");
          } else {
            this.$message.success("数据更新成功！");
            this.getParamsData();
            this.editCateDialogVisible = false;
          }
        }
      });
    },
    // 删除分类
    async removeParams(attr_id) {
      console.log(attr_id);
      const confirmResult = await this.$confirm(
        "此操作将永久删除该文件, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(error => error);
      if (confirmResult !== "confirm") {
        return this.$message.info("您取消了删除！");
      } else {
        const { data: res } = await this.$http.delete(
          `categories/${this.cateId}/attributes/${attr_id}`
        );
        if (res.meta.status !== 200) {
          this.$message.error("删除数据失败，请稍后再试！");
        } else {
          this.$message.success("删除成功！");
          this.getParamsData();
        }
      }
    },
    // 小标签按钮的触发事件,就是autofocus事件
    showInput() {
      this.inputVisible = true;
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    // 小标签输入框的触发事件
    handleInputConfirm(row) {
      if (this.inputValue.trim().length === 0) {
        this.inputValue = "";
        this.inputVisible = false;
        return;
      } else {
        row.attr_vals.push(this.inputValue.trim());
        this.inputValue = "";
        this.inputVisible = false;
        this.saveAttrVals(row);
      }
    },
    // 向服务器提交小标签数据
    async saveAttrVals(row) {
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(" ")
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("提交编辑参数失败");
      } else {
        this.$message.success("编辑参数成功！");
      }
    },
    // 删除动态参数静态属性参数名称的参数
    handleClose(i, row) {
      row.attr_vals.splice(i, 1);
      this.saveAttrVals(row);
    }
  },
  created() {
    // 获取级联选择器需要的数据
    this.getCateList();
  },
  computed: {
    // 判断按钮是否禁用
    btnDisabled() {
      if (this.selectedCateKeys.length !== 3) {
        return true;
      } else {
        return false;
      }
    },
    // 获取及联选择器中的ID值
    cateId() {
      if (this.selectedCateKeys.length == 3) {
        return this.selectedCateKeys[2];
      } else {
        null;
      }
    }
  }
};
</script>
<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}
.el-cascader {
  width: 300px;
}
.el-tag {
  margin-right: 15px;
}
.input-new-tag {
  width: 120px;
}
</style>