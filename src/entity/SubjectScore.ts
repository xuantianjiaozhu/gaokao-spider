import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class SubjectScore {
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
    name: 'subject_name',
    length: 1024,
    comment: '专业名称',
    nullable: true,
  })
  subjectName: string;

  @Column({
    name: 'pici',
    length: 255,
    comment: '录取批次',
    nullable: true,
  })
  pici: string;

  @Column({
    name: 'min_score_position',
    length: 255,
    comment: '最低分/最低位次',
    nullable: true,
  })
  minScorePosition: string;

  @Column({
    name: 'subject_requirements',
    length: 255,
    comment: '选科要求',
    nullable: true,
  })
  subjectRequirements: string;
}
