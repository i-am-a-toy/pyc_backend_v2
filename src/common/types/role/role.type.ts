import { Enum, EnumType } from 'ts-jenum';

@Enum('role')
export class Role extends EnumType<Role>() {
  static readonly ADMIN = new Role(0, 'ADMIN', '관리자');
  static readonly PASTOR = new Role(1, 'PASTOR', '목사님');
  static readonly PASTOR_WIFE = new Role(2, 'PASTOR_WIFE', '사모님');
  static readonly JUNIOR_PASTOR = new Role(3, 'JUNIOR_PASTOR', '전도사님');
  static readonly GROUP_LEADER = new Role(4, 'GROUP_LEADER', '그룹리더');
  static readonly NEWBIE_TEAM_LEADER = new Role(5, 'NEWBIE_TEAM_LEADER', '새친구팀장');
  static readonly LEADER = new Role(6, 'LEADER', '셀리더');
  static readonly MEMBER = new Role(7, 'MEMBER', '셀원');
  static readonly NEWBIE = new Role(8, 'NEWBIE', '새신자');

  private constructor(readonly code: number, readonly role: string, readonly name: string) {
    super();
  }
}
