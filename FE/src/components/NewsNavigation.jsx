import { useState, useEffect } from "react";
import { Menu } from "antd";
import { Link, useLocation } from "react-router-dom";
import styled from "styled-components";

const StyledMenu = styled(Menu)`
  background-color: #f0f2f5;
  border-right: none;

  .ant-menu-item {
    margin: 0;
    height: 50px;
    line-height: 50px;
    border-bottom: 1px solid #e8e8e8;

    &:hover {
      color: #1890ff;
      background-color: #e6f7ff;
    }
  }

  .ant-menu-item-selected {
    background-color: #e6f7ff;
    font-weight: bold;
    border-right: 3px solid #1890ff;
  }
`;

const NewsNavigation = () => {
  const location = useLocation();
  const [selectedKey, setSelectedKey] = useState("");

  useEffect(() => {
    // Extract the category from the URL path
    const pathParts = location.pathname.split("/");
    const category = pathParts[pathParts.length - 1];
    setSelectedKey(category || "all");
  }, [location]);

  const categories = [
    { key: "all", label: "Tất cả tin tức", path: "/news" },
    { key: "uu-dai", label: "Ưu đãi hấp dẫn", path: "/news/category/uu-dai" },
    {
      key: "tin-tuc-suc-khoe",
      label: "Tin tức sức khoẻ",
      path: "/news/category/tin-tuc-suc-khoe",
    },
    {
      key: "hoat-dong",
      label: "Hoạt động VNVC toàn quốc",
      path: "/news/category/hoat-dong",
    },
    {
      key: "khai-truong",
      label: "Khai trương VNVC toàn quốc",
      path: "/news/category/khai-truong",
    },
    {
      key: "livestream",
      label: "Livestream tư vấn",
      path: "/news/category/livestream",
    },
    {
      key: "tu-van",
      label: "Tư vấn kiến thức sức khoẻ",
      path: "/news/category/tu-van",
    },
    {
      key: "cuoc-thi",
      label: "Cuộc thi và sự kiện",
      path: "/news/category/cuoc-thi",
    },
    {
      key: "doi-tac",
      label: "Đối tác và hợp tác",
      path: "/news/category/doi-tac",
    },
  ];

  return (
    <StyledMenu
      mode="vertical"
      selectedKeys={[selectedKey]}
      style={{ width: "100%" }}
    >
      {categories.map((category) => (
        <Menu.Item key={category.key}>
          <Link to={category.path}>{category.label}</Link>
        </Menu.Item>
      ))}
    </StyledMenu>
  );
};

export default NewsNavigation;
