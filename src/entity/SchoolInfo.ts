import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class SchoolInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'school_id', comment: '学校的编号（url 里的）' })
  schoolId: number;

  @Index()
  @Column({ name: 'school_name', length: 255, comment: '学校名称' })
  schoolName: string;

  @Column({
    name: 'tags',
    length: 1024,
    comment: '本科, 985, 双一流',
    nullable: true,
  })
  tags: string;

  @Column({
    name: 'address',
    length: 255,
    comment: '学校省市',
    nullable: true,
  })
  address: string;

  @Column({
    name: 'website',
    length: 255,
    comment: '学校网址',
    nullable: true,
  })
  website: string;

  @Column({
    name: 'phone',
    length: 255,
    comment: '学校电话',
    nullable: true,
  })
  phone: string;

  @Column({
    name: 'shisu',
    length: 1024,
    comment: '学校食宿',
    nullable: true,
  })
  shisu: string;

  @Column({
    name: 'detail',
    type: 'text',
    comment: '学校详情',
    nullable: true,
  })
  detail: string;
}
