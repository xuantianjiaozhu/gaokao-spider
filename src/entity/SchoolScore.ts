import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class SchoolScore {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'school_id', comment: '学校的编号（url 里的）' })
  schoolId: number;

  @Index()
  @Column({ name: 'school_name', length: 255, comment: '学校名称' })
  schoolName: string;

  @Column({ name: 'city', length: 255, comment: '城市' })
  city: string;

  @Column({ name: 'year', comment: '年份' })
  year: number;

  @Column({ name: 'wenli', length: 255, comment: '选科' })
  wenli: string;

  @Column({
    name: 'pici',
    length: 255,
    comment: '录取批次',
    nullable: true,
  })
  pici: string;

  @Column({
    name: 'enrollment_type',
    length: 255,
    comment: '招生类型',
    nullable: true,
  })
  enrollmentType: string;

  @Column({
    name: 'min_score_position',
    length: 255,
    comment: '最低分/最低位次',
    nullable: true,
  })
  minScorePosition: string;

  @Column({
    name: 'province_control_line',
    length: 255,
    comment: '省控线',
    nullable: true,
  })
  provinceControlLine: string;

  @Column({
    name: 'major_group',
    length: 255,
    comment: '专业组',
    nullable: true,
  })
  majorGroup: string;

  @Column({
    name: 'subject_requirements',
    length: 255,
    comment: '选科要求',
    nullable: true,
  })
  subjectRequirements: string;
}
