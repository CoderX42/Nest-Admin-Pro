import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PostService } from './post.service';
import { CreatePostDto, UpdatePostDto, QueryPostDto } from './dto/post.dto';
import { JwtAuthGuard } from '../../../auth/jwt.guard';

@ApiTags('System - Post Management')
@Controller('system/post')
@UseGuards(JwtAuthGuard)
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get('list')
  @ApiOperation({ summary: 'Get post list' })
  async list(@Query() query: QueryPostDto) {
    return this.postService.list(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get post by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create post' })
  async create(@Body() dto: CreatePostDto) {
    return this.postService.create(dto);
  }

  @Put()
  @ApiOperation({ summary: 'Update post' })
  async update(@Body() dto: UpdatePostDto) {
    return this.postService.update(dto);
  }

  @Delete(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete post' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.postService.remove(id);
  }
}