package com.anmory.anmoryblog.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

/**
 * @author Anmory/李梦杰
 * @description TODO
 * @date 2025-05-20 下午10:55
 */

@Mapper
public interface VisitMapper {
    @Update("update visit set count=count+1")
    int updateCount();

    @Select("select count from visit")
    int selectCount();
}
