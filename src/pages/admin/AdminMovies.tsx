import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  DatePicker,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Pagination,
  Select,
  Switch,
  Table,
} from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import {
  adminService,
  type MoviePayload,
} from "../../common/services/admin.service";
import type { ICategory } from "../../common/types/category";
import type { IMovie } from "../../common/types/movie";

const projectionFormatOptions = [
  { value: "2D", label: "2D" },
  { value: "3D", label: "3D" },
  { value: "IMAX", label: "IMAX" },
];

interface MovieFormValues
  extends Omit<MoviePayload, "actors" | "release_date" | "end_date"> {
  actorsText: string;
  releaseDate: dayjs.Dayjs;
  endDate: dayjs.Dayjs;
}

const AdminMovies = () => {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [editing, setEditing] = useState<IMovie | null>(null);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<MovieFormValues>();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["ADMIN", "MOVIES", page, keyword],
    queryFn: () =>
      adminService.movies({
        page,
        per_page: 10,
        keyword: keyword || undefined,
        sort: "release_date",
      }),
  });
  const categories = useQuery({
    queryKey: ["ADMIN", "MOVIE_FORM_CATEGORIES"],
    queryFn: () => adminService.categories({ per_page: 100, status: true }),
  });
  const save = useMutation({
    mutationFn: (payload: MoviePayload) =>
      editing
        ? adminService.updateMovie(editing._id, payload)
        : adminService.createMovie(payload),
    onSuccess: async () => {
      setOpen(false);
      setEditing(null);
      form.resetFields();
      await queryClient.invalidateQueries({ queryKey: ["ADMIN"] });
    },
  });
  const disable = useMutation({
    mutationFn: adminService.disableMovie,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ADMIN"] }),
  });

  const openForm = (movie?: IMovie) => {
    setEditing(movie || null);
    const movieCategories = (movie?.category as ICategory[] | undefined) || [];
    form.setFieldsValue(
      movie
        ? {
            name: movie.name,
            description: movie.description,
            poster: movie.poster,
            trailer: movie.trailer,
            actorsText: movie.actor.join(", "),
            director: movie.director,
            rating: movie.rating,
            age_require: movie.ageRequire,
            country: movie.country,
            language: movie.language,
            sub_language: movie.subLanguage,
            available_projection_formats: movie.availableProjectionFormats || [
              "2D",
            ],
            duration: movie.duration,
            releaseDate: dayjs(movie.releaseDate),
            endDate: dayjs(movie.endDate),
            is_featured: movie.isFeatured,
            status: movie.status,
            category_ids: movieCategories.map((item) => Number(item._id)),
          }
        : {
            age_require: "P",
            rating: 5,
            available_projection_formats: ["2D"],
            is_featured: false,
            status: true,
          },
    );
    setOpen(true);
  };

  const submit = (values: MovieFormValues) => {
    const { actorsText, releaseDate, endDate, ...rest } = values;
    save.mutate({
      ...rest,
      actors: actorsText
        .split(",")
        .map((actor) => actor.trim())
        .filter(Boolean),
      release_date: releaseDate.format("YYYY-MM-DD"),
      end_date: endDate.format("YYYY-MM-DD"),
    });
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#DC0000]">
            Movies
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold">Quản lý phim</h1>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => openForm()}
        >
          Thêm phim
        </Button>
      </div>
      <Input
        allowClear
        prefix={<SearchOutlined />}
        placeholder="Tìm tên phim, đạo diễn..."
        className="mt-6 max-w-md"
        onPressEnter={(event) => {
          setPage(1);
          setKeyword(event.currentTarget.value.trim());
        }}
        onClear={() => setKeyword("")}
      />
      <div className="mt-4 overflow-hidden border border-white/10 bg-[#141414]">
        <Table<IMovie>
          rowKey="_id"
          loading={query.isLoading}
          dataSource={query.data?.items}
          pagination={false}
          scroll={{ x: 1000 }}
          columns={[
            {
              title: "Poster",
              dataIndex: "poster",
              width: 75,
              render: (value, record) => (
                <Image
                  src={value}
                  alt={record.name}
                  width={42}
                  height={63}
                  className="object-cover"
                />
              ),
            },
            { title: "Tên phim", dataIndex: "name", width: 220 },
            {
              title: "Thời lượng",
              dataIndex: "duration",
              render: (v) => `${v} phút`,
            },
            { title: "Điểm", dataIndex: "rating", width: 70 },
            {
              title: "Định dạng",
              dataIndex: "availableProjectionFormats",
              width: 150,
              render: (value: string[] = []) => value.join(", "),
            },
            {
              title: "Phát hành",
              dataIndex: "statusRelease",
              render: (value) =>
                ({
                  nowShowing: "Đang chiếu",
                  upcoming: "Sắp chiếu",
                  released: "Đã chiếu",
                })[value as string],
            },
            {
              title: "Trạng thái",
              dataIndex: "status",
              render: (value) => (value ? "Hoạt động" : "Đã tắt"),
            },
            {
              title: "",
              width: 110,
              render: (_, record) => (
                <div className="flex gap-2">
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => openForm(record)}
                  />
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    disabled={!record.status}
                    onClick={() =>
                      Modal.confirm({
                        title: "Tắt phim này?",
                        onOk: () => disable.mutateAsync(record._id),
                      })
                    }
                  />
                </div>
              ),
            },
          ]}
        />
      </div>
      <Pagination
        className="mt-5"
        align="end"
        current={page}
        pageSize={query.data?.pageSize || 10}
        total={query.data?.total || 0}
        onChange={setPage}
      />

      <Modal
        title={editing ? "Cập nhật phim" : "Thêm phim"}
        open={open}
        width={900}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={save.isPending}
      >
        <Form form={form} layout="vertical" onFinish={submit}>
          <div className="grid gap-x-4 md:grid-cols-2">
            <Form.Item
              name="name"
              label="Tên phim"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="director"
              label="Đạo diễn"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="poster"
              label="URL poster"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="trailer" label="URL trailer">
              <Input />
            </Form.Item>
            <Form.Item
              name="actorsText"
              label="Diễn viên, cách nhau bởi dấu phẩy"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="category_ids"
              label="Thể loại"
              rules={[{ required: true }]}
            >
              <Select
                mode="multiple"
                options={categories.data?.items.map((item) => ({
                  value: Number(item._id),
                  label: item.name,
                }))}
              />
            </Form.Item>
            <Form.Item
              name="age_require"
              label="Độ tuổi"
              rules={[{ required: true }]}
            >
              <Select
                options={["P", "K", "C13", "C16", "C18"].map((value) => ({
                  value,
                  label: value,
                }))}
              />
            </Form.Item>
            <Form.Item
              name="available_projection_formats"
              label="Định dạng phim có bản chiếu"
              rules={[{ required: true }]}
            >
              <Select mode="multiple" options={projectionFormatOptions} />
            </Form.Item>
            <Form.Item
              name="duration"
              label="Thời lượng (phút)"
              rules={[{ required: true }]}
            >
              <InputNumber min={1} max={1000} className="w-full" />
            </Form.Item>
            <Form.Item name="rating" label="Điểm đánh giá">
              <InputNumber min={0} max={10} step={0.1} className="w-full" />
            </Form.Item>
            <Form.Item
              name="releaseDate"
              label="Ngày khởi chiếu"
              rules={[{ required: true }]}
            >
              <DatePicker className="w-full" />
            </Form.Item>
            <Form.Item
              name="endDate"
              label="Ngày kết thúc"
              rules={[{ required: true }]}
            >
              <DatePicker className="w-full" />
            </Form.Item>
            <Form.Item name="country" label="Quốc gia">
              <Input />
            </Form.Item>
            <Form.Item name="language" label="Ngôn ngữ">
              <Input />
            </Form.Item>
            <Form.Item name="sub_language" label="Phụ đề">
              <Input />
            </Form.Item>
            <div className="flex gap-6">
              <Form.Item
                name="is_featured"
                label="Nổi bật"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                name="status"
                label="Hoạt động"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </div>
          </div>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminMovies;
